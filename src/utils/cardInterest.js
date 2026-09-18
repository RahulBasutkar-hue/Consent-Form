// LOCAL PLACEHOLDER — credit card offer interest is stored in the browser until ServiceNow is wired.

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

export async function submitCardOfferInterest(payload) {
  // TODO: Replace this stub with the ServiceNow API call that records the user's
  // interest in credit card offers. Suggested payload:
  // { sys_id, user_name, email, name, intent: 'credit_card_offers' }
  void payload;

  await new Promise((resolve) => setTimeout(resolve, 350));
  return { ok: true };
}
