# Talk MLC con Joshua Freedman — Deploy su Vercel

Landing del talk **"Intelligenza emotiva: Maurizio La Cava intervista Joshua Freedman"**
(mercoledì 15 luglio 2026, 17:00–18:00 CEST, Microsoft Teams).

## Struttura del progetto

```
Progetto Talk Joshua/
├── index.html                  ← landing page (modalità pre-evento: form di registrazione)
├── api/
│   └── webinar-handler.js      ← Vercel Serverless Function (Node.js) → ActiveCampaign
├── assets/
│   ├── logo-mlc.svg
│   ├── Home_client-logos.svg
│   ├── maurizio-portrait.webp
│   ├── joshua-freedman.webp    ← DA INSERIRE (foto ufficiale ospite)
│   └── emotion-rules-cover.webp← DA INSERIRE (cover libro)
├── vercel.json                 ← cache headers + clean URLs
├── .env.example                ← riferimento env vars (NON committare segreti)
├── commit.bat / setup-git.bat / fix-author.bat
└── README-deployment.md
```

## Repo & identità Git

- Repo: **github.com/LauraFazio/webinar-talk-josh-freedman**
- Identità commit: **Laura Fazio &lt;laura@mlcpresentations.com&gt;** (email verificata su GitHub LauraFazio).
  Se l'autore non è questa email, Vercel blocca il deploy con "Deployment was blocked".

## Deploy in 4 step

### 1. Env vars in Vercel

Vercel → Project → Settings → Environment Variables (Production, Preview, Development):

| Nome | Valore |
|---|---|
| `AC_API_URL` | `https://mlcpresentationdesign.api-us1.com` |
| `AC_API_KEY` | *(API key ActiveCampaign — solo in Vercel, mai nel repo)* |
| `AC_LIST_NAME` | `WEBINARS` |
| `AC_TAG_NAME` | `[registered] 2026_07_15_TalkJosh` *(non usata dall'handler, ma la teniamo per coerenza)* |
| `ALLOWED_ORIGIN` | `https://mlcpresentations.com` |
| `SETUP_TOKEN` | `mlc-webinar-setup-2026` |

### 2. Deploy

Importa il repo GitHub su Vercel (account Hobby di Laura Fazio) → ogni push su `main` fa auto-deploy.

> Gotcha: se Vercel non triggera dopo un push →
> `git commit --allow-empty -m "trigger" && git push`

### 3. Inizializza ActiveCampaign (una volta)

Apri:
```
https://<dominio>/api/webinar-handler?setup=1&token=mlc-webinar-setup-2026
```
Risolve la lista `WEBINARS` e crea il tag `[registered] 2026_07_15_TalkJosh` se non esiste.

### 4. Test form

Compila il form con un'email di test → verifica in AC: contatto creato, in lista WEBINARS, con il tag applicato.

## Automazione email (ActiveCampaign)

- **Trigger**: Tag is added → `[registered] 2026_07_15_TalkJosh`
- **Azione**: Send email con link Microsoft Teams del talk
- **Reminder opzionale**: Wait fino al 15 luglio + email reminder
- Logica re-tag (delete + re-add nell'handler) → ri-triggera l'automation a ogni nuovo submit.

## Risorse post-evento

Bonus "easy": ai partecipanti inviamo via email le risorse dell'incontro (link diretto a PDF/Notion).
Microsoft Forms non permette upload file con "Anyone can respond" → usare link diretto.

## Troubleshooting

| Problema | Fix |
|---|---|
| Vercel non deploya dopo push | `git commit --allow-empty -m "trigger" && git push` |
| `index.html` truncato dopo push | `git checkout HEAD -- index.html` |
| Vercel "Deployment blocked" | `git config user.email` deve essere `laura@mlcpresentations.com` |
| Form 502 | Vercel → Logs → cerca errori AC API |
| `?setup=1` → 401 | token URL ≠ env var `SETUP_TOKEN` |
