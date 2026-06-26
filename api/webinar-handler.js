/**
 * Vercel Serverless Function — Talk MLC con Joshua Freedman (15 luglio 2026)
 * POST /api/webinar-handler  → registra un iscritto in ActiveCampaign
 *                              con il tag dell'evento (data singola)
 * GET  /api/webinar-handler?setup=1&token=...
 *                              → risolve la list + crea (se mancante) il tag
 *
 * Configurazione (Vercel Project Settings → Environment Variables):
 *   AC_API_URL     = https://mlcpresentationdesign.api-us1.com
 *   AC_API_KEY     = la-tua-api-key
 *   AC_LIST_NAME   = WEBINARS
 *   ALLOWED_ORIGIN = https://mlcpresentations.com
 *   SETUP_TOKEN    = mlc-webinar-setup-2026
 *
 * NB: la env var AC_TAG_NAME non serve (il tag e' hardcoded sotto in WEBINAR_DATES).
 *     Puoi lasciarla su Vercel o rimuoverla, e' ignorata da questo handler.
 */

const AC_API_URL     = process.env.AC_API_URL     || 'https://mlcpresentationdesign.api-us1.com';
const AC_API_KEY     = process.env.AC_API_KEY     || '';
const AC_LIST_NAME   = process.env.AC_LIST_NAME   || 'WEBINARS';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'https://mlcpresentations.com';
const SETUP_TOKEN    = process.env.SETUP_TOKEN    || 'mlc-webinar-setup-2026';

// Mappa data evento -> tag ActiveCampaign.
// La data qui deve coincidere con CONFIG.WEBINAR_DATE nel form (index.html).
const WEBINAR_DATES = {
  '2026-07-15': '[registered] 2026_07_15_TalkJosh',
};

// In-memory cache: persiste tra invocazioni "warm" della stessa istanza Vercel
let cachedListId = null;
const cachedTagIds = {}; // { tagName: tagId }

async function acFetch(method, endpoint, body = null) {
  const url = AC_API_URL.replace(/\/$/, '') + endpoint;
  const res = await fetch(url, {
    method,
    headers: {
      'Api-Token': AC_API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = {};
  try { data = await res.json(); } catch (_) { /* non-JSON response */ }
  return { status: res.status, ok: res.ok, data };
}

async function resolveListId() {
  if (cachedListId) return cachedListId;
  const r = await acFetch('GET',
    `/api/3/lists?filters[name]=${encodeURIComponent(AC_LIST_NAME)}&limit=100`);
  if (r.data && Array.isArray(r.data.lists)) {
    for (const list of r.data.lists) {
      if (list.name && list.name.toLowerCase() === AC_LIST_NAME.toLowerCase()) {
        cachedListId = parseInt(list.id, 10);
        return cachedListId;
      }
    }
  }
  return null;
}

async function resolveOrCreateTagId(tagName) {
  if (cachedTagIds[tagName]) return cachedTagIds[tagName];

  // 1) Cerca tag esistente
  const search = await acFetch('GET',
    `/api/3/tags?search=${encodeURIComponent(tagName)}&limit=100`);
  if (search.data && Array.isArray(search.data.tags)) {
    for (const tag of search.data.tags) {
      if (tag.tag && tag.tag.toLowerCase() === tagName.toLowerCase()) {
        cachedTagIds[tagName] = parseInt(tag.id, 10);
        return cachedTagIds[tagName];
      }
    }
  }

  // 2) Non esiste → crealo
  const create = await acFetch('POST', '/api/3/tags', {
    tag: {
      tag: tagName,
      tagType: 'contact',
      description: `Iscritti al Talk MLC con Joshua Freedman - ${tagName}`,
    },
  });
  if (create.data && create.data.tag && create.data.tag.id) {
    cachedTagIds[tagName] = parseInt(create.data.tag.id, 10);
    return cachedTagIds[tagName];
  }
  return null;
}

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') return res.status(204).end();

  // ===== Endpoint diagnostico ?setup=1&token=... =====
  // Risolve la list e il tag dell'evento (lo crea se non esiste).
  if (req.method === 'GET' && req.query && req.query.setup) {
    if (req.query.token !== SETUP_TOKEN) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    // Forza re-resolve
    cachedListId = null;
    for (const k of Object.keys(cachedTagIds)) delete cachedTagIds[k];

    const listId = await resolveListId();
    const tags = {};
    for (const [date, tagName] of Object.entries(WEBINAR_DATES)) {
      const tagId = await resolveOrCreateTagId(tagName);
      tags[date] = { tag_name: tagName, tag_id: tagId };
    }
    return res.status(200).json({
      success: true,
      list_name: AC_LIST_NAME,
      list_id: listId,
      tags,
      note: 'List + tag evento risolti e cachati. Pronti per i form submit.',
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // ===== Parse body =====
  const data = (typeof req.body === 'object' && req.body !== null) ? req.body : {};
  const date      = String(data.date      || '').trim();
  const firstName = String(data.firstName || '').trim();
  const lastName  = String(data.lastName  || '').trim();
  const email     = String(data.email     || '').trim().toLowerCase();
  const jobTitle  = String(data.jobTitle  || '').trim();
  const company   = String(data.company   || '').trim();
  const privacy   = !!data.privacy;

  // ===== Validate =====
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!firstName || !lastName || !jobTitle || !privacy || !emailRe.test(email)) {
    return res.status(422).json({ success: false, error: 'Campi mancanti o non validi' });
  }
  const selectedTagName = WEBINAR_DATES[date];
  if (!selectedTagName) {
    return res.status(422).json({
      success: false,
      error: 'Data evento non valida o non selezionata',
      validDates: Object.keys(WEBINAR_DATES),
    });
  }

  // ===== 1) Upsert contact =====
  const contactRes = await acFetch('POST', '/api/3/contact/sync', {
    contact: { email, firstName, lastName },
  });
  if (!contactRes.ok || !contactRes.data || !contactRes.data.contact || !contactRes.data.contact.id) {
    console.error('AC contact sync error', contactRes);
    return res.status(502).json({ success: false, error: 'Errore nella creazione del contatto' });
  }
  const contactId = parseInt(contactRes.data.contact.id, 10);

  // ===== 2) Add to list "WEBINARS" =====
  try {
    const listId = await resolveListId();
    if (listId) {
      await acFetch('POST', '/api/3/contactLists', {
        contactList: { list: listId, contact: contactId, status: 1 },
      });
    } else {
      console.error(`AC list "${AC_LIST_NAME}" not found`);
    }
  } catch (e) { console.error('Add to list failed', e); }

  // ===== 3) Re-apply tag corrispondente alla data scelta =====
  // Logica: se il tag e' gia' sul contatto, lo rimuoviamo e lo riapplichiamo.
  // Questo fa riattivare le automation AC con trigger "Tag is added"
  // (altrimenti un secondo submit non triggererebbe nulla).
  try {
    const tagId = await resolveOrCreateTagId(selectedTagName);
    if (tagId) {
      const existing = await acFetch('GET',
        `/api/3/contacts/${contactId}/contactTags`);
      if (existing.ok && existing.data && Array.isArray(existing.data.contactTags)) {
        for (const ct of existing.data.contactTags) {
          if (parseInt(ct.tag, 10) === tagId) {
            // DELETE associazione esistente -> re-trigger automation al re-add
            await acFetch('DELETE', `/api/3/contactTags/${ct.id}`);
          }
        }
      }
      // POST nuovo contactTag (sempre, anche se prima non c'era)
      await acFetch('POST', '/api/3/contactTags', {
        contactTag: { contact: contactId, tag: tagId },
      });
    }
  } catch (e) { console.error('Re-apply tag failed', e); }

  // ===== 4) Note con data scelta, ruolo, azienda =====
  try {
    await acFetch('POST', '/api/3/notes', {
      note: {
        note: `Data evento: ${date}\nRuolo: ${jobTitle}\nAzienda: ${company}\nSource: landing Talk MLC con Joshua Freedman`,
        relid: contactId,
        reltype: 'Subscriber',
      },
    });
  } catch (e) { console.error('Note add failed', e); }

  return res.status(200).json({
    success: true,
    contactId,
    date,
    tag: selectedTagName,
  });
}
