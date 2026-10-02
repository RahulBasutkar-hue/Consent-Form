// Stores the successful offer-interest state for this browser session.

const STORAGE_KEY = 'uia_card_offer_interest';

const readStore = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const getCardOfferInterestSent = (userKey) => {
  if (!userKey) {
    return false;
  }
  return Boolean(readStore()[userKey]);
};

export const setCardOfferInterestSent = (userKey, sent = true) => {
  if (!userKey) {
    return;
  }

  const next = { ...readStore(), [userKey]: Boolean(sent) };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
};


// Per-card interest: which specific cards this user tapped "I'm interested" on.
// LOCAL PLACEHOLDER — the ServiceNow offer_details API currently only records a
// yes/no flag, so the chosen card names are kept in the browser for display.
const PER_CARD_STORAGE_KEY = 'uia_card_interest_by_card';

const readPerCardStore = () => {
  try {
    const raw = localStorage.getItem(PER_CARD_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

export const getCardKey = (card) => `${card?.cardName || ''}-${card?.category || ''}`;

export const getInterestedCardKeys = (userKey) => {
  if (!userKey) {
    return [];
  }
  const list = readPerCardStore()[userKey];
  return Array.isArray(list) ? list : [];
};

export const addInterestedCardKey = (userKey, cardKey) => {
  if (!userKey || !cardKey) {
    return;
  }
  const store = readPerCardStore();
  const current = Array.isArray(store[userKey]) ? store[userKey] : [];
  if (current.includes(cardKey)) {
    return;
  }
  const next = { ...store, [userKey]: [...current, cardKey] };
  try {
    localStorage.setItem(PER_CARD_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable — the in-memory state still updates for this session.
  }
};
