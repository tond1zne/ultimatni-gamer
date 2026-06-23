# Ultimate Streamer Challenge

Webová appka pro výzvy (hry + IRL), body, týdenní žebříčky a admin schvalování důkazů.

**Stack:** Next.js 14 (frontend + backend v jednom) · Prisma + SQLite · NextAuth (přihlášení) · Tailwind (černobílý comic styl)

---

## 1. Co appka umí

- Registrace a přihlášení uživatelů
- Seznam výzev (hry / IRL), každá má obtížnost a počet bodů
- Uživatel u výzvy vloží **odkaz** na video/screenshot (YouTube, Twitch klip, Google Drive, atd.)
- Admin vidí všechny odeslané důkazy, schválí (a může upravit počet bodů) nebo zamítne
- Žebříček celkový i pro každou jednotlivou výzvu
- Týdenní cyklus s časovačem na hlavní stránce — po vypršení se týden uzavře a startuje nový (uzavře se i automaticky, ale admin to může udělat i manuálně v `/admin/week`)
- Historie uzavřených týdnů a jejich žebříčků

## 2. Co budeš potřebovat

- Node.js verze 18 nebo novější (https://nodejs.org)
- Textový editor / terminál
- Pro nasazení: jakýkoliv server, který umí spustit Node.js appku (VPS, Railway, Render...) **nebo** Vercel + externí databáze (vysvětleno níže v sekci Nasazení)

## 3. Spuštění na vlastním počítači

```bash
# 1. Rozbal/zkopíruj projekt a přejdi do složky
cd streamer-challenges

# 2. Nainstaluj závislosti
npm install

# 3. Vytvoř .env soubor podle vzoru
cp .env.example .env
# otevři .env a vlož vlastní NEXTAUTH_SECRET (vygeneruješ např. příkazem: openssl rand -base64 32)

# 4. Vytvoř databázi (SQLite soubor dev.db se vytvoří automaticky)
npx prisma db push

# 5. Nahraj počáteční data (admin účet + pár ukázkových výzev)
npm run db:seed

# 6. Spusť appku
npm run dev
```

Appka poběží na **http://localhost:3000**.

### Výchozí admin účet

Seed script vytvoří admin účet:

- **email:** `admin@streamer.gg`
- **heslo:** `admin123`

**Hned po prvním přihlášení si v `/admin` zvaž vytvoření vlastního admin účtu a změnu hesla** (úpravu hesla přímo přes UI appka nemá — nejrychlejší je smazat starý seed účet a vytvořit nový admin účet přes `npx prisma studio`, viz níže).

Pokud chceš jiný email/heslo pro admina hned od začátku, spusť seed takto:

```bash
SEED_ADMIN_EMAIL="tvuj@email.cz" SEED_ADMIN_PASSWORD="silneheslo123" npm run db:seed
```

### Jak udělat z běžného uživatele admina

Nejjednodušší způsob je přes Prisma Studio (grafické rozhraní nad databází):

```bash
npm run db:studio
```

Otevře se v prohlížeči. Najdi tabulku `User`, u daného uživatele změň pole `role` z `USER` na `ADMIN` a ulož.

## 4. Jak appka funguje v praxi

1. **Admin** v `/admin/challenges` vytvoří výzvy — název, popis, kategorie (Hra/IRL), obtížnost a body.
2. **Hráč** se zaregistruje, na `/challenges` si vybere výzvu, splní ji, nahraje video/screenshot
   na YouTube/Twitch/Drive/atd. a do appky vloží jen **odkaz**.
3. **Admin** v `/admin/submissions` vidí všechny čekající důkazy, klikne na odkaz, ověří a buď
   **schválí** (může i upravit počet přidělených bodů) nebo **zamítne** (s důvodem).
4. Schválené body se okamžitě promítnou do žebříčků — celkového i u dané výzvy.
5. Na hlavní stránce běží **časovač** do konce týdne. Po vypršení se týden automaticky uzavře
   a začne nový (nikdo nic nemusí ručně dělat). Historie týdnů a jejich žebříčků zůstává
   dostupná v `/leaderboard` (výběr týdne) a v `/admin/week`.

## 5. Nasazení do provozu

### Varianta A — vlastní server / VPS (doporučeno, nejjednodušší pro SQLite)

```bash
npm install
npx prisma db push
npm run db:seed
npm run build
npm run start   # appka poběží na portu 3000
```

Doporučeno spustit appku přes `pm2` (aby běžela na pozadí a restartovala se po výpadku) a před
ní si dát **nginx** jako reverzní proxy s HTTPS (např. přes Certbot). Nezapomeň v `.env` nastavit
`NEXTAUTH_URL` na skutečnou doménu (`https://tvoje-domena.cz`).

### Varianta B — Vercel / serverless hosting

Vercel nemá trvalý souborový systém, takže SQLite soubor (`dev.db`) by se ztrácel. Pro Vercel
je potřeba přepnout databázi na hostovaný Postgres (např. Neon, Supabase, Railway — všechny
mají zdarma tier):

1. V `prisma/schema.prisma` změň `provider = "sqlite"` na `provider = "postgresql"`.
2. Do `.env` / Vercel proměnných prostředí vlož `DATABASE_URL` z Postgres poskytovatele.
3. `npx prisma db push` (lokálně, proti vzdálené databázi) a `npm run db:seed`.
4. Nasaď přes `vercel` CLI nebo propojení s GitHub repozitářem.

## 6. Struktura projektu (pro orientaci)

```
prisma/schema.prisma     - datový model (User, Week, Challenge, Submission)
prisma/seed.ts           - počáteční data (admin, první týden, ukázkové výzvy)
src/lib/                 - prisma klient, NextAuth konfigurace, logika týdnů/žebříčků
src/actions/             - serverové akce (registrace, odeslání důkazu, admin akce)
src/app/                 - jednotlivé stránky (Next.js App Router)
src/components/          - opakovaně použité UI komponenty
```

## 7. Možná rozšíření do budoucna

- Vlastní upload videí/screenshotů přímo na server (místo odkazů) — vyžaduje úložiště
  (např. S3/Cloudflare R2) a je to větší změna v backendu
- Notifikace e-mailem při schválení/zamítnutí
- Sezónní žebříček (souhrn za více týdnů)
- Komentáře/diskuze u jednotlivých výzev
