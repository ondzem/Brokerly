# Brokerly — Agent Rules (Stage 1: "Denní jádro" / Daily Core)

> **This is a persistent Rules / system-prompt file. Read it fully before every task.**
> Rules are written in English. **The application UI, all labels, and all enum values are Czech** and must be used **exactly** as written below. Do not translate Czech field labels or enum values into English in the UI.

---

## 0. How you (the agent) must work

- **Plan first, build second.** Before writing code, produce a short implementation plan (as a plan artifact) and **wait for my approval**. Do not start building until I approve.
- **Scope is law.** You build **Stage 1 only** (see §7 "Do NOT build"). If any task seems to require a feature from a later stage (automation, AI, email/SMS, matching, portals, documents, reporting), **STOP and ask** instead of building it.
- **Follow the spec literally.** Build the data model exactly as specified in §4 — fields, types, required flags, enums. **Do not invent extra fields or features** ("Nic nevymýšlet navíc").
- **Build order:** (1) DB schema → (2) relations → (3) seed/test data → (4) the 4 daily views → (5) run the test walkthrough (§6) and produce a verification artifact.
- **One concern per step.** Don't mix unrelated work in a single change. Keep changes reviewable.
- **When unsure, ask.** A short question beats a wrong assumption. Never guess business rules.

---

## 1. What Brokerly is (context)

Brokerly is a **done-for-you AI back office + CRM for Czech real-estate agents** (realitní makléři). It is a service, not just software: we set up the system, connect automations, and operate them.

**Architecture — hub-and-spoke:**
- **CRM = data store.** Holds everything about leads, properties and clients. It stores and displays data; on its own it does nothing.
- **Automation layer = the hands.** Reacts to data and acts (replies, books viewings, reminds, follows up). *(Later stages — NOT part of Stage 1.)*

Because every automation only reads/writes the tables, **the tables are built first.** That is this stage.

**Core unit of work = Deal:** one interested person about one property. The Deal is the **bridge** connecting a person (who) with a property (what), moving through stages from lead to signature.

**Target user:** a **solo real-estate agent** in Czechia. Office/team segment comes later — in this stage all "kancelář" (office) fields are created but left empty.

**Why this product exists (the pain):** agents lose 20–30 % of leads to slow replies, forget owners who want to sell later, get no-shows and "real-estate tourists", and spend 1.5–2 h/day on admin. Stage 1 gives them a **usable CRM core** they can run a real deal through by hand.

---

## 2. Stage 1 goal & definition of done

**Goal:** a usable CRM — **five linked tables**, **four daily views**, verified by a manual test walkthrough. **No automation.**

**Done when:** a test deal goes from `lead` to `podpis` **using only the views** (kanban + cards + reminders), nothing snags, and all four views work. Only then is Stage 2 opened.

---

## 3. Tech stack (fixed — do not substitute)

- **Framework:** Next.js (App Router) + **TypeScript**
- **Styling:** Tailwind CSS
- **UI components:** shadcn/ui (customized — must not look like stock defaults; see §8)
- **Database & backend:** **Supabase** (Postgres). Real database from day one.
- **ORM/queries:** Supabase client (or Drizzle if you prefer typed schema — ask first).
- **Auth:** none needed for Stage 1 (single solo agent, local/dev). Do not build login flows yet.
- Keep the project deployable (e.g. Vercel + Supabase) so it can later be handed to a client on a domain. Do not deploy in this stage unless asked.

Column names in the DB may be English `snake_case` (as given below); **displayed labels are the Czech strings in quotes.**

---

## 4. Data model — 5 tables (build exactly)

Legend: `req*` = at least one of the starred fields required · `req†` = required only for that kind/role · `link→X` = relation to table X · **auto** = system-generated.

### 4.1 KONTAKT — a person (`contacts`)
One card per person even with multiple roles. Identity = phone or email; **always search for a match before creating** (dedup, see §6-rules).

**Block: Základ**
| column | UI label | type | required | enum (Czech) |
|---|---|---|---|---|
| full_name | "Jméno a příjmení" | text | yes | — |
| phone | "Telefon" | text | req* | — |
| email | "E-mail" | text | req* | — |
| roles | "Role" | multi-select | yes | kupující; vlastník; protistrana; doporučitel |
| source | "Odkud přišel" | select | yes | Sreality; iDNES; web; doporučení; cold call; monitoring; osobní |
| status | "Stav" | select | yes (never empty) | nový; kontaktovaný; kvalifikovaný; klient; ztracený |
| temperature | "Teplota (skóre)" | select | no | horký; vlažný; studený |
| note | "Poznámka" | long text | no | — |
| created_at | "Vznik karty" | date | auto | — |

**Block: Co hledá — buyer demand profile (only when role includes `kupující`)**
| column | UI label | type | required | enum |
|---|---|---|---|---|
| seeking_transaction | "Hledá: transakce" | select | req† (buyer) | koupě; pronájem |
| seeking_kind | "Hledá: druh" | multi-select | no | byt; dům; pozemek; komerční |
| seeking_location | "Hledá: lokalita" | text (multi) | no | — |
| seeking_layout | "Hledá: dispozice" | multi-select | no | 1+kk; 2+kk; 2+1; 3+kk; 3+1; 4+ a více |
| budget_from | "Rozpočet od" | number | no | — |
| budget_to | "Rozpočet do" | number | no | — |
| purpose | "Účel" | select | no | vlastní bydlení; investice; rekreace; jiné |
| seeking_until | "Aktivně hledá do" | date | no | — |

**Block: Souhlas (GDPR)**
| column | UI label | type | required | enum |
|---|---|---|---|---|
| gdpr_consent | "Souhlas GDPR" | bool | no | ano; ne |
| consent_date | "Datum souhlasu" | date | no | — |
| consent_source | "Zdroj souhlasu" | select | no | poptávka z portálu; formulář; osobně; e-mail |

### 4.2 NEMOVITOST — what is sold/rented (`properties`)
Branches by `kind`: common fields always apply; then fill **only** the block matching the kind. Fields `facts_for_answers` and `handover_term` are the **only source** AI later answers from — outside them it never guesses.

**Block: Společná pole (always)**
| column | UI label | type | required | enum |
|---|---|---|---|---|
| owner | "Vlastník" | link→Kontakt | yes | — |
| kind | "Druh" | select | yes | byt; dům; pozemek; komerční; garáž/ostatní |
| transaction | "Transakce" | select | yes | prodej; pronájem |
| address | "Adresa" | text | yes | — |
| offer_status | "Stav nabídky" | select | yes | akvizice; prodá později; příprava; v nabídce; rezervováno; uzavřeno; staženo |
| price | "Cena / nájem" | number | yes | — |
| facts_for_answers | "Co je v ceně / fakta pro odpovědi" | long text | no | — |
| handover_term | "Možný termín předání" | text | no | — |
| listing_id | "ID inzerátu" | text | no | — |
| attachments | "Fotky / dokumenty" | files | no | — |

**Block: Jen pro BYT (required when kind = byt)**
| column | UI label | type | required | enum |
|---|---|---|---|---|
| flat_layout | "Dispozice" | select | req† | 1+kk; 2+kk; 2+1; 3+kk; 3+1; 4+kk; 4+1; 5 a více |
| flat_area | "Užitná plocha (m²)" | number | req† | — |
| floor | "Patro / z pater" | text | no | — |
| ownership | "Vlastnictví" | select | no | osobní; družstevní; SVJ |
| construction | "Konstrukce" | select | no | cihla; panel; jiné |
| flat_condition | "Stav bytu" | select | no | novostavba; po rekonstrukci; dobrý; před rekonstrukcí |
| flat_features | "Výtah / balkon / sklep" | multi-select | no | výtah; balkon/lodžie; terasa; sklep |
| flat_penb | "PENB" | select | no | A; B; C; D; E; F; G |

**Block: Jen pro DŮM (required when kind = dům)**
| column | UI label | type | required | enum |
|---|---|---|---|---|
| house_layout | "Dispozice / místnosti" | select | req† | 2+kk; 3+kk; 4+kk; 5+kk; 6 a více |
| house_area | "Užitná plocha (m²)" | number | req† | — |
| land_area | "Plocha pozemku (m²)" | number | req† | — |
| house_type | "Typ domu" | select | no | samostatný; řadový; dvojdomek |
| floors_count | "Počet podlaží" | number | no | — |
| house_features | "Garáž / zahrada / bazén" | multi-select | no | garáž; zahrada; bazén |
| house_condition | "Stav domu" | select | no | novostavba; po rekonstrukci; dobrý; před rekonstrukcí |
| house_penb | "PENB" | select | no | A; B; C; D; E; F; G |

**Deferred blocks — Pozemek, Komerční, Pronájem:** create the DB columns per the master spec, but **do not surface them in the Stage-1 forms and do not fill them.** Do not delete them. (Columns: pozemek → výměra, druh pozemku, zasíťování, územní plán, přístup, šířka/tvar/svažitost · komerční → podtyp, podlahová plocha, stav/vybavenost, parkování/vjezd, PENB · pronájem → kauce, poplatky/služby, doba nájmu, dostupné od, vybavení.) If you need their exact enums, ask.

### 4.3 DEAL — one deal (`deals`)
One interested person about one specific property = one Deal. Same person interested in two properties = two Deals.

| column | UI label | type | required | enum |
|---|---|---|---|---|
| buyer | "Kupující / zájemce" | link→Kontakt | yes | — |
| property | "Nemovitost" | link→Nemovitost | no | — |
| deal_name | "Název obchodu" | text | auto | e.g. "Veselá — Bory 3+kk" (name + property) |
| stage | "Fáze" | select | yes (never empty) | lead; kontaktován; kvalifikován; prohlídka; nabídka; rezervace; podpis; prohráno |
| result | "Výsledek" | select | yes (never empty) | otevřený; vyhraný; prohraný |
| temperature | "Teplota (skóre)" | select | no | horký (A); vlažný (B); studený (C) |
| financing | "Financování" | select | no | hotovost; hypotéka schválená; hypotéka v řešení; neřešeno |
| must_sell_first | "Musí nejdřív prodat" | bool | no | ano; ne |
| moving_term | "Termín stěhování" | select | no | do 1 měsíce; do 3 měsíců; do 6 měsíců; nespěchá |
| value | "Hodnota" | number | no | — |
| next_step | "Další krok" | text | no | — (shown on kanban card) |
| next_step_date | "Termín dalšího kroku" | date | no | — |
| created_at | "Vznik obchodu" | date | auto | — |
| expected_close | "Očekávané uzavření" | date | no | — |
| closed_date | "Datum uzavření" | date | no | — |
| loss_reason | "Důvod prohry" | select | no | cena; financování; koupil jinde; rozmyslel si; nedostupné; jiné |
| assigned_agent | "Přiřazený makléř" | link→tým | no | office only — leave empty this stage |

### 4.4 AKTIVITA — history + reminders (`activities`)
Two functions in one table: (a) a record of the past (call/email/viewing); (b) a future reminder. Distinguished by `is_reminder` + `when`. The timeline (on contact and deal) is built from activities.

| column | UI label | type | required | enum |
|---|---|---|---|---|
| type | "Typ" | select | yes | hovor; e-mail; SMS; schůzka; prohlídka; poznámka; PŘIPOMÍNKA; follow-up |
| content | "Text / obsah" | long text | yes | — |
| contact | "Kontakt" | link→Kontakt | yes | — |
| deal | "Obchod (deal)" | link→Deal | no | — |
| when | "Kdy (datum a čas)" | datetime | yes | record = when it happened; reminder = when to alert |
| is_reminder | "Je to připomínka?" | bool | yes | ano; ne |
| done | "Hotovo" | bool | no | ano; ne |
| direction | "Směr" | select | no | příchozí; odchozí |
| followup_result | "Výsledek follow-upu" | select | no | vážný zájem; zvažuje; nezaujalo; nedovolal jsem se |
| who | "Kdo (makléř)" | text | no | office only — leave empty |

### 4.5 NASTAVENÍ — agent profile / config (`settings`)
Not a table of records — **one settings record per agent.** Later feeds speed-to-lead (voice, signature, escalation). Build the fields now; office block stays empty. In Stage 1 these are config only — **not wired to any automation.**

| column | UI label | type | required | enum |
|---|---|---|---|---|
| agent_name | "Jméno makléře" | text | yes | — |
| sender_phone | "Telefon odesílatele" | text | yes | — |
| sender_email | "E-mail odesílatele" | text | yes | — |
| signature | "Podpis" | long text | yes | — |
| addressing | "Oslovení" | select | yes | tykání; vykání |
| tone | "Tón" | select | yes | přátelský; věcný; formální |
| reply_samples | "Ukázky mých odpovědí" | long text | no | — |
| languages | "Jazyky" | multi-select | no | CZ; EN; DE; UA |
| reaction_limit_min | "Reakční limit (speed-to-lead)" | number (min) | yes | — |
| escalation_rule | "Pravidlo eskalace" | long text | yes | — |
| working_hours | "Pracovní doba" | text | no | — |
| qualification_questions | "Kvalifikační otázky" | long text | no | — |
| lead_assignment_rule | "Pravidlo přiřazení leadu" | select | no | rotace; podle lokality; podle vytížení — office only, empty |
| no_reply_escalation_min | "Eskalace při nereakci (min)" | number | no | office only, empty |
| report_recipient | "Příjemce reportu" | text | no | office only, empty |

---

## 5. Relations & the 4 daily views

### 5.1 Relations (make the tables a system)
| relation | cardinality | you can then see |
|---|---|---|
| Kontakt → Deal | 1 : N | all of a person's deals on their card |
| Nemovitost → Deal | 1 : N | list of interested people on a property card |
| Kontakt → Nemovitost | 1 : N | an owner's listings on their card |
| Kontakt → Aktivita | 1 : N | timeline on the person |
| Deal → Aktivita | 1 : N | timeline on the deal |

**Verify:** from a person's card click through to their deal, from the deal to the property, and back.

### 5.2 The 4 views (a view adds no data — it displays it usefully)
1. **Kanban obchodů** (from Deal): columns = values of `Fáze`; card shows `Název obchodu`, `Teplota`, `Financování`, `Další krok` + `Termín dalšího kroku`. **Drag a card = change stage.**
2. **Karta kontaktu** (Kontakt + Deal + Aktivita): person's fields + linked deals + activity timeline (newest first).
3. **Karta nemovitosti** (Nemovitost + Deal): property fields + list of interested Deals with stage & temperature.
4. **Dnešní připomínky** (Aktivita): filter `Je to připomínka = ano`, `Hotovo = ne`, `Kdy ≤ dnes`; sort by `Kdy`. This is the daily to-do — nothing falls through.

---

## 6. System rules + test walkthrough

**System rules (apply everywhere):**
- **Dedup before create, always:** search by `phone`, then `email`. A match reuses the existing card (add the role) — never create a second card. One person may hold multiple roles at once.
- **Never-empty fields:** `Stav` (Kontakt) and `Fáze` + `Výsledek` (Deal) must never be empty, or records "disappear" from views.
- **Deferred blocks** (pozemek, komerční, pronájem, office fields) are **not deleted** — just not filled this stage.
- **GDPR:** consent is recorded on first contact (Kontakt → Souhlas block).
- A portal lead pairs to a property via `ID inzerátu`; if no match, the Deal is created without a property and flagged for manual completion. *(Pairing logic itself is a later stage — in Stage 1 this is manual.)*

**Test walkthrough (proves the model — do this with seed data):**
1. Create an owner (p. Novák) + his flat (2+kk, `v nabídce`, `facts_for_answers` filled).
2. Create 2 buyers with the "Co hledá" block; a Deal on that flat for each (stage `lead`).
3. Move stages: `lead → kontaktován → kvalifikován` (fill financing) `→ prohlídka → nabídka → rezervace → podpis`; second buyer → `prohráno` + loss reason.
4. On each step log an Aktivita and at least 2 reminders; verify the timeline and Dnešní připomínky.
5. Note anything that snags (missing field, wrong enum) → fix immediately.

---

## 7. Do NOT build in this stage
- **No automations, no AI, no email/SMS integration** — everything is manual.
- No matching, no morning digest, no drip, no acquisition/monitoring, no AI Studio.
- Do not fill pozemek / komerční / pronájem or office (kancelář) fields.
- No portal publishing, no documents/e-sign, no reporting dashboards.
- Do not add any field or feature not in §4.
- Do not build authentication/multi-tenant yet.

If a request would cross any of these lines, **stop and confirm with me first.**

---

## 8. Design system — "editorial premium minimal"

The visual identity must radiate **premium, trust and professionalism** — this is a tool for a prestigious, well-paid profession (real-estate agents). Think **high-end editorial brand meets the clarity of Linear/Notion.** Not a loud, generic SaaS.

**Principles**
- **Minimal & editorial.** Generous whitespace, strong typographic hierarchy, calm and confident. Content-first, decoration-free.
- **Speed for the user.** Built for busy agents: **no redundant helper text, concise labels, everything scannable in seconds.** Every screen understandable at a glance. Fewer things on screen, clearly arranged.
- **Trustworthy & bespoke.** Must feel custom-made and high-end — never like stock shadcn defaults.

**Tokens (baseline — refine tastefully)**
- **Background:** warm near-white (e.g. `#FAFAF8`); surfaces slightly lighter/white with subtle hairline borders.
- **Text:** near-black ink (e.g. `#141414`); muted grey for secondary.
- **Accent:** ONE restrained, sophisticated accent used sparingly (deep ink/navy or a deep forest green — pick one and stay consistent). No gradients, no bright primary-blue SaaS look.
- **Status colors:** muted, not neon (e.g. soft green/amber/red for teplota & výsledek).
- **Typography:** a refined sans for UI (Inter / Geist). Optionally a modern serif for large headings to get the editorial feel. Clear scale, comfortable line-height.
- **Shape & depth:** restrained radius, hairline borders, very soft shadows. Nothing bubbly.
- **Motion:** minimal and purposeful (drag feedback on kanban, subtle transitions). No flashy animation.
- **Responsive:** layouts should work on mobile (agent in the field), but do not gold-plate — set up a solid, consistent design system now; later stages inherit it.

**Balance:** the Stage-1 priority is a working, correct data model and the 4 views. Apply this design system as the visual baseline — establish tokens and components once — but **do not rathole on pixel polish.** Function correct first, styled to this system, then stop.

---

## 9. Reference
Source of truth for scope and fields: **Brokerly — Etapa 1: Denní jádro** working document (chapters 14–17, 20 and the Part II checklist). If this Rules file and that document ever conflict, ask me — do not resolve it yourself.
