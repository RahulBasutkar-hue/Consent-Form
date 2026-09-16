// LOCAL PLACEHOLDER — DPDP consent + OTP verification status is stored in the browser.
// TODO: Replace this module with a backend/DB lookup (e.g. GET/PUT user consent)
// so the value is the source of truth after login, not localStorage.

const STORAGE_KEY = 'uia_dpdp_consent';

export const CONSENT_STATUS = {
  PENDING: 'pending',
  GIVEN: 'given',
  OPTED_OUT: 'opted_out'
};

const readStore = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const getConsentStatus = (userKey) => {
  if (!userKey) {
    return CONSENT_STATUS.PENDING;
  }

  const record = readStore()[userKey];
  if (record === CONSENT_STATUS.GIVEN || record === CONSENT_STATUS.OPTED_OUT) {
    return record;
  }

  return CONSENT_STATUS.PENDING;
};

export const setConsentStatus = (userKey, status) => {
  if (!userKey) {
    return;
  }

  const next = { ...readStore(), [userKey]: status };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
};
