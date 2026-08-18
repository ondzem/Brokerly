# Drag-and-drop image upload with fixed-ratio cropping

A portable spec for rebuilding this feature in another project. **Logic only** — no
styling, no copy. Any framework works; the reference implementation is React + a
Supabase-style object store.

Reference files in this repo: `src/components/PhotoUploader.tsx`, `src/lib/storage.ts`.

---

## 1. What the feature guarantees

1. The user drops files (or picks them) — no URLs, no external hosting step.
2. Every image passes through a crop editor before it is stored.
3. **All stored images come out at exactly the same pixel dimensions and the same
   aspect ratio.** This is the whole point: galleries, cards and thumbnails then
   never jump around.
4. The crop box can be moved and resized from 4 corners **and** 4 edges, and it can
   never leave the image or invert.

The single source of truth is one pair of constants:

```ts
export const TARGET_WIDTH  = 1200;
export const TARGET_HEIGHT = 800;
export const ASPECT = TARGET_WIDTH / TARGET_HEIGHT;   // 1.5
```

Changing the output format = changing those two numbers. Nothing else in the crop
math, the initial box, or the render is allowed to hard-code a ratio.

---

## 2. State machine

```
idle ──drop/pick──▶ queue[] ──▶ cropping(queue[0]) ──confirm──▶ upload ──▶ stored[]
                       ▲                    │                              │
                       └────────────────────┴──discard──────────────────────┘
```

- `queue: string[]` — data URLs of files waiting to be cropped.
- `cropping` is not a separate flag: the editor is shown iff `queue[0]` exists.
- On confirm **or** discard, `queue.shift()`. Multi-file selection therefore
  becomes a one-at-a-time crop loop with no extra code.
- `stored: string[]` — final public URLs, owned by the parent (controlled component:
  `{ value, onChange }`). Index 0 is the primary/cover image by convention.

Files are read with `FileReader.readAsDataURL` in parallel (`Promise.all`), then
appended to the queue. Non-image MIME types are filtered out before reading.

---

## 3. Two coordinate systems — the part that breaks naive implementations

There are three sizes in play and they must never be confused:

| space | meaning |
|---|---|
| **natural** | `img.naturalWidth/Height` — the real pixels of the file |
| **display** | `img.clientWidth/Height` — what the browser painted (image is capped by CSS) |
| **target** | `TARGET_WIDTH/HEIGHT` — the fixed output |

**Rule: the crop rectangle is always stored in _natural_ coordinates.**

- Pointer deltas arrive in display pixels → divide by `scale` before applying.
- The crop overlay is drawn by multiplying the rectangle by `scale`.

```ts
const scale = img.clientWidth / natural.width;   // recomputed on every render
const dx = (e.clientX - startX) / scale;          // display → natural
const box = { left: crop.x * scale, top: crop.y * scale,
              width: crop.width * scale, height: crop.height * scale };
```

Storing the crop in display pixels instead is the classic bug: the crop silently
changes meaning when the container resizes or the image is capped by `max-height`.

---

## 4. Initial crop

The largest rectangle of the target ratio that fits inside the image, centred:

```ts
function initialCrop(nw: number, nh: number): Rect {
  let width = nw, height = nw / ASPECT;
  if (height > nh) { height = nh; width = nh * ASPECT; }
  return { x: (nw - width) / 2, y: (nh - height) / 2, width, height };
}
```

Computed in the image's `onLoad` handler, where `naturalWidth` first becomes
available. The same function backs a "reset / whole photo" action.

---

## 5. Drag model

One handler covers all nine interactions. `handle ∈ {move, nw, ne, sw, se, n, s, w, e}`.

On `pointerdown`, snapshot `{ handle, startX, startY, startCrop }` into a **ref**
(not state — it must not trigger renders and must be readable synchronously).
`pointermove` / `pointerup` are bound on `window`, not on the element, so a fast
drag that leaves the element does not strand the gesture.

### 5.1 move

Pure translation, clamped so the box stays inside the image. Size never changes:

```ts
x = clamp(start.x + dx, 0, natural.width  - start.width);
y = clamp(start.y + dy, 0, natural.height - start.height);
```

### 5.2 resize — derive width, then force height

Because the ratio is locked, **only one dimension is ever a free variable**. Compute
a candidate `width`, then `height = width / ASPECT`. Never compute both from the
pointer.

- **edge `e` / `w`**: `width = start.width ± dx`
- **edge `n` / `s`**: `height = start.height ± dy`, then `width = height * ASPECT`
- **corner**: the pointer moves in two axes at once, so pick the *dominant* one.
  Compare the horizontal drag against the vertical drag scaled into width units:

  ```ts
  width = Math.abs(dx) > Math.abs(dy * ASPECT)
        ? start.width  + dx * signX          // horizontal dominates
        : (start.height + dy * signY) * ASPECT;   // vertical dominates
  ```

  where `signX = handle.includes('e') ? 1 : -1`, `signY = handle.includes('s') ? 1 : -1`.
  Comparing raw `|dx|` vs `|dy|` instead feels wrong to the user on non-square
  ratios — the `* ASPECT` puts both deltas in the same unit.

### 5.3 Anchoring

Resizing must keep the *opposite* side pinned, otherwise the box drifts:

```ts
if (handle.includes('w')) x = start.x + start.width  - width;   // right edge pinned
if (handle.includes('n')) y = start.y + start.height - height;  // bottom edge pinned
if (handle === 'n' || handle === 's') x = start.x + (start.width  - width)  / 2;
if (handle === 'w' || handle === 'e') y = start.y + (start.height - height) / 2;
```

Corner handles pin the opposite corner; edge handles grow symmetrically on the
perpendicular axis so the box stays visually centred on that edge.

### 5.4 Clamping — order matters

Apply in exactly this order, and **re-derive height after every width change**:

1. `width = max(MIN_SIZE, width)` — `MIN_SIZE` is in natural pixels (e.g. 80).
2. If `x < 0`: `width += x` (x is negative → shrink by the overhang), `x = 0`.
   If `y < 0`: `y = 0`.
3. If `x + width  > natural.width`:  `width = natural.width - x`.
4. `height = width / ASPECT` (re-derive).
5. If `y + height > natural.height`: `height = natural.height - y`;
   `width = height * ASPECT`.
6. If the result is below `MIN_SIZE`, **abort the frame** (`return`) rather than
   committing a degenerate box. Silently ignoring one pointermove is invisible;
   a collapsed or inverted rectangle is not.

Clamping width and height independently is the other classic bug — it breaks the
ratio lock at the image borders.

---

## 6. Rendering the overlay

- `touch-action: none` + `user-select: none` on the frame, `draggable={false}` on
  the `<img>`: otherwise the browser's own image drag and touch scrolling hijack the
  gesture on mobile.
- Dimming outside the crop = **four absolutely positioned rectangles** (above,
  below, left, right of the box) with `pointer-events: none`. A single element with
  a giant `box-shadow` also works but clips badly inside scroll containers.
- Handles are children of the crop box and call `stopPropagation` on
  `pointerdown`, so grabbing a handle doesn't also start a `move`.
- Handle hit areas should be ~14 px in *display* pixels regardless of zoom.

---

## 7. Producing the output

Canvas does the crop and the rescale in one `drawImage` call. Source rectangle =
crop in natural coordinates; destination rectangle = the fixed target:

```ts
const canvas = document.createElement('canvas');
canvas.width = TARGET_WIDTH; canvas.height = TARGET_HEIGHT;
const ctx = canvas.getContext('2d');
ctx.imageSmoothingQuality = 'high';
ctx.drawImage(img, crop.x, crop.y, crop.width, crop.height,
                   0, 0, TARGET_WIDTH, TARGET_HEIGHT);
canvas.toBlob(cb, 'image/jpeg', 0.86);
```

Because the destination is constant, **the output is uniform no matter what the
user did** — that is where guarantee #3 is actually enforced, not in the UI.

Notes:
- `toBlob` is async; the confirm action must await it and hold a `busy` flag that
  disables the buttons (double-submit protection).
- The crop rectangle came from the same `<img>` element that is passed to
  `drawImage`, so no re-decoding is needed.
- A cross-origin image taints the canvas and makes `toBlob` throw. Files read via
  `FileReader` are same-origin data URLs, so this path is safe; if you ever accept
  remote URLs, set `crossOrigin="anonymous"` and expect failures.

---

## 8. Storage contract

```ts
async function upload(blob: Blob): Promise<string>   // → public URL
```

- Random, collision-proof key: `${Date.now()}-${random}.jpg`. Never the original
  filename (user-controlled, may collide, may contain unsafe characters).
- `contentType: 'image/jpeg'`, long `cacheControl` — the object is immutable.
- **Detect the "bucket/container does not exist" error and rethrow it with a message
  that names the exact migration or setup step.** This one is worth the branch: it
  is the single most common first-run failure and the raw SDK error explains nothing.
- The component only ever appends the returned URL to `stored[]`. Deleting from
  `stored[]` removes the reference; garbage-collecting orphaned objects is a
  separate concern and deliberately out of scope.

---

## 9. Checklist for a rebuild

- [ ] Ratio lives in exactly one place; changing it changes everything.
- [ ] Crop rectangle stored in natural pixels, converted only at the render/pointer boundary.
- [ ] `pointermove`/`pointerup` on `window`, drag snapshot in a ref.
- [ ] Resize derives one dimension and forces the other.
- [ ] Corner drag picks the dominant axis using `|dy * ASPECT|`.
- [ ] Opposite side pinned per handle.
- [ ] Clamp in order, re-derive height, abort below minimum.
- [ ] `touch-action: none`, `draggable={false}`.
- [ ] Canvas destination is the constant target size.
- [ ] `busy` flag around the async confirm.
- [ ] Missing-bucket error rewritten into an actionable message.
