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

