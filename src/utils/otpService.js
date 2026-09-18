const OTP_API_BASE = '/otp-dev';

const OTP_HEADERS = {
  'X-OTP-Key': '380fd02764ebc32e2f3a91e06aeb8b42',
  accept: 'application/json',
  'content-type': 'application/json'
};

const OTP_SENDER = '659346da-a9c5-491d-bfa8-2619e4f2f7f7';
const OTP_TEMPLATE = '6f65097b-bce3-42ba-a9dd-2bfcbb9a974b';
export const OTP_CODE_LENGTH = 4;

export const toOtpPhone = (rawPhone) => {
  const digits = String(rawPhone || '').replace(/\D/g, '');
  if (!digits) {
    return '';
  }
  if (digits.length === 10) {
    return `91${digits}`;
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return `91${digits.slice(1)}`;
  }
  if (digits.startsWith('91')) {
    return digits;
  }
  return digits;
};

export const maskPhone = (rawPhone) => {
  const phone = toOtpPhone(rawPhone);
  if (phone.length < 6) {
    return phone;
  }
  return `${phone.slice(0, 4)}******${phone.slice(-2)}`;
};

export const sendOtp = async (rawPhone) => {
  const phone = toOtpPhone(rawPhone);
  if (!phone) {
    throw new Error('No phone number is available for this user.');
  }

  const response = await fetch(`${OTP_API_BASE}/v1/verifications`, {
    method: 'POST',
    headers: OTP_HEADERS,
    body: JSON.stringify({
      data: {
        channel: 'sms',
        sender: OTP_SENDER,
        phone,
        template: OTP_TEMPLATE,
        code_length: OTP_CODE_LENGTH
      }
    })
  });

  if (response.status !== 201) {
    let detail = '';
    try {
      const body = await response.json();
      detail = body?.message || body?.error || '';
    } catch {
      detail = '';
    }
    throw new Error(detail || `Could not send OTP (${response.status}).`);
  }

  return phone;
};

export const verifyOtp = async (rawPhone, code) => {
  const phone = toOtpPhone(rawPhone);
  if (!phone) {
    throw new Error('No phone number is available for this user.');
  }

  const params = new URLSearchParams({ code: String(code).trim(), phone });
  const response = await fetch(`${OTP_API_BASE}/v1/verifications?${params.toString()}`, {
    method: 'GET',
    headers: {
      'X-OTP-Key': OTP_HEADERS['X-OTP-Key'],
      accept: 'application/json'
    }
  });

  if (!response.ok) {
    let detail = '';
    try {
      const body = await response.json();
      detail = body?.message || body?.error || '';
    } catch {
      detail = '';
    }
    throw new Error(detail || `Could not verify OTP (${response.status}). Try again.`);
  }

  const body = await response.json();
  const matches = Array.isArray(body?.data)
    ? body.data
    : body?.data
      ? [body.data]
      : [];
  if (matches.length === 0) {
    throw new Error('Invalid or expired OTP.');
  }

  return true;
};
