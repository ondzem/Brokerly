#!/usr/bin/env python3
"""
Nahraje do Supabase migrace, které tam ještě nejsou.

Používá Management API, takže nepotřebuje heslo k databázi ani nalinkované
CLI — stačí osobní přístupový token v .env.local jako SUPABASE_ACCESS_TOKEN.

    python3 scripts/db-push.py            # nahraje, co chybí
    python3 scripts/db-push.py --dry-run  # jen vypíše, co by nahrál

Které migrace už proběhly, si drží tabulka _brokerly_migrations přímo
v databázi — ne soubor na disku, aby to sedělo oběma vývojářům.
"""
import json
import os
import pathlib
import sys
import urllib.error
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
MIGRATIONS = ROOT / "supabase" / "migrations"
API = "https://api.supabase.com/v1/projects/{ref}/database/query"

# Ověřeno proti běžící databázi: tabulky, RLS, provize i ekonomika už existují.
BASELINE = [
    "20260705122116_schema.sql",
    "20260705124351_enable_rls.sql",
    "20260706174245_add_commission.sql",
    "20260712190000_add_economics.sql",
    "20260714203353_add_complete_test_property.sql",
    "20260714204716_add_prague_flat_test_property.sql",
]


def load_env() -> dict:
    env = {}
    path = ROOT / ".env.local"
    if path.exists():
        for line in path.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip().strip('"').strip("'")
    env.update({k: v for k, v in os.environ.items() if k.startswith("SUPABASE_")})
    return env


def run_sql(ref: str, token: str, sql: str):
    req = urllib.request.Request(
        API.format(ref=ref),
        data=json.dumps({"query": sql}).encode(),
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            # Bez běžné hlavičky User-Agent vrací Cloudflare před API 403
            # (error 1010) — vypadá to jako chyba tokenu, ale není.
            "User-Agent": "brokerly-db-push/1.0",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            body = r.read().decode()
            return json.loads(body) if body.strip() else []
    except urllib.error.HTTPError as e:
        detail = e.read().decode()
        try:
            detail = json.loads(detail).get("message", detail)
        except json.JSONDecodeError:
            pass
        raise SystemExit(f"❌ Supabase odmítl SQL ({e.code}): {detail}")


def main() -> None:
    dry = "--dry-run" in sys.argv
    env = load_env()

    url = env.get("NEXT_PUBLIC_SUPABASE_URL", "")
    ref = url.replace("https://", "").split(".")[0]
    token = env.get("SUPABASE_ACCESS_TOKEN")

    if not ref:
        raise SystemExit("❌ V .env.local chybí NEXT_PUBLIC_SUPABASE_URL.")
    if not token:
        raise SystemExit(
            "❌ Chybí SUPABASE_ACCESS_TOKEN.\n"
            "   Vytvořte token na https://supabase.com/dashboard/account/tokens\n"
            "   a přidejte ho do .env.local jako:  SUPABASE_ACCESS_TOKEN=sbp_…"
        )

    fresh = not run_sql(ref, token, """
        select 1 from information_schema.tables
        where table_schema = 'public' and table_name = '_brokerly_migrations';
    """)

    run_sql(ref, token, """
        create table if not exists public._brokerly_migrations (
            name text primary key,
            applied_at timestamptz not null default now()
        );
    """)

    # Tyhle migrace se spouštěly ručně přes SQL editor, ještě než tenhle
    # skript vznikl. Jejich SQL není idempotentní (create table), takže je
    # při prvním běhu zapíšeme jako hotové, místo abychom je pouštěli znovu.
    if fresh:
        for name in BASELINE:
            if (MIGRATIONS / name).exists():
                run_sql(ref, token,
                        "insert into public._brokerly_migrations (name) "
                        "values ($tag${}$tag$) on conflict do nothing;".format(name))
        print(f"ℹ️  Označeno jako už hotové: {len(BASELINE)} dřívějších migrací.")

    done = {r["name"] for r in run_sql(
        ref, token, "select name from public._brokerly_migrations;")}

    pending = sorted(f for f in MIGRATIONS.glob("*.sql") if f.name not in done)
    if not pending:
        print("✅ Databáze je aktuální, není co nahrávat.")
        return

    for f in pending:
        if dry:
            print(f"→ nahrálo by se: {f.name}")
            continue
        print(f"→ {f.name}")
        run_sql(ref, token, f.read_text())
        run_sql(ref, token,
                "insert into public._brokerly_migrations (name) values ($tag${}$tag$);"
                .format(f.name))

    if not dry:
        print(f"✅ Nahráno migrací: {len(pending)}")


if __name__ == "__main__":
    main()
