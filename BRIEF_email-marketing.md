# Brief — Piano email marketing per il Talk MLC con Joshua Freedman

> Documento di contesto da incollare come primo messaggio in una **nuova task/chat** dedicata al piano di email marketing.

## Obiettivo della nuova task
Creare un **piano email marketing strutturato** per sponsorizzare il webinar, in **più email separate**: una sequenza promozionale per spingere le iscrizioni (verso contatti non ancora iscritti) e una sequenza di nurture/reminder per chi è già iscritto. Tono **MLC**, email in **inglese** (il talk è in inglese).

## L'evento
- **Format:** MLC Podcast — Maurizio La Cava intervista autori internazionali. Questo episodio è **live**.
- **Titolo:** Emotional Intelligence — *the skill behind every conversation that works*.
- **Ospite:** **Joshua Freedman** — CEO & co-founder di Six Seconds (rete EQ più grande al mondo, 150+ paesi), Master Certified Coach (ICF), autore di *Emotion Rules* (2026). Ha coniato il concetto di **"Emotional Recession"**; guida lo studio globale *State of the Heart* (EQ misurata in 160+ paesi).
- **Conduce:** **Maurizio La Cava** — founder MLC Presentation Design Consulting, host del podcast MLC.
- **Data/ora:** mercoledì **15 luglio 2026**, **17:00–18:00 CEST**.
- **Piattaforma:** Microsoft Teams (link riunione già creato).
- **Lingua:** inglese.
- **Target:** ampio — professionisti, manager, founder (pubblico MLC); rilevante per chi comunica, vende, presenta.
- **Bonus iscritti:** le risorse dell'incontro via email (versione "easy", nessun e-learning/masterclass).
- **Prezzo:** gratuito.

## Angoli di contenuto già usati (riusabili nelle email)
- EQ come vantaggio che l'AI non può replicare ("the edge AI can't replace").
- "Emotional Recession": un trend globale da trasformare in vantaggio personale.
- Ascolto attivo, fiducia, decisioni: l'EQ dietro ogni comunicazione/pitch che funziona.
- Autorevolezza ospite: Six Seconds, 160+ paesi, autore best-seller, *Emotion Rules*.

## Asset e link
- **Landing live:** https://webinar-talk-josh-freedman.vercel.app
- **OG image** brandizzata per anteprime social: `/assets/og-webinar.jpg`
- Foto: Joshua Freedman (headshot), Maurizio La Cava (ritratto), render 3D del libro *Emotion Rules*.
- LinkedIn: Joshua → linkedin.com/in/freedman · Maurizio → linkedin.com/in/mauriziolacava
- **Brand:** nero/bianco/giallo `#FFDB46`, font **Gilroy** (caricato). Tono: skill `mlc-tone-of-voice` (anti-fuffa, diretto, ironico ma competente).

## Stato CRM (ActiveCampaign — account mlcpresentationdesign)
- **Lista:** WEBINARS (id 31).
- **Tag iscritti:** `[registered] 2026_07_15_TalkJosh` (id 899) — applicato dal form della landing (logica delete+re-add per ri-triggerare le automazioni).
- **Automazione di conferma** (in setup): trigger *Tag added* → email con link Teams + "Add to calendar" (Google/Outlook).
- **Vincolo tecnico:** la connessione AC via MCP è **in sola lettura** → email e automazioni vanno costruite a mano nel pannello AC (Claude può scrivere le copy e guidare passo-passo).

## Meccanica di iscrizione (importante per le email)
- **Iscriversi = avere il tag** `[registered] 2026_07_15_TalkJosh` (che fa partire l'automazione di conferma con link Teams + add to calendar).
- **Contatti già in ActiveCampaign:** NON serve il form. Usa il **one-click RSVP** → bottone "Save my seat" nell'email + automazione con trigger *"Clicks a link"* → azione *"Add tag"*. Click = iscritto.
- **Traffico freddo / social / LinkedIn** (non ancora in lista): rimanda alla **landing** col form (cattura nome + email + tag).
- Conseguenza per il piano: le email a lista esistente puntano al one-click; i post/ads social puntano alla landing.

## Cosa dovrebbe produrre il piano (suggerimento di struttura)
1. **Calendario invii** rispetto al 15 luglio (es. T-14, T-7, T-3, T-1, giorno-evento, +reminder iscritti).
2. Per ogni email: **segmento/obiettivo, oggetto + preheader, angolo/hook, struttura del corpo, CTA**.
3. Distinzione tra **acquisizione** (non iscritti → spingere registrazione) e **nurture/reminder** (iscritti → far presenziare).
4. Eventuale email **post-evento** (risorse + registrazione, se prevista).
5. Tutto on-brand MLC, in inglese, copy pronte da incollare in ActiveCampaign.
