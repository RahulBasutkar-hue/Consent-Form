import React, { useEffect, useRef, useState } from 'react';
import { OTP_CODE_LENGTH, maskPhone, sendOtp, toOtpPhone, verifyOtp } from '../../utils/otpService';
import '../../styles/OTPVerification.css';

const OTPVerification = ({ phone = '', onClose, onVerify, onPhoneProvided }) => {
  const sentForPhone = useRef('');
  const sendInFlight = useRef(false);
  const [phoneNumber, setPhoneNumber] = useState(phone);
  const [phoneSubmitted, setPhoneSubmitted] = useState(Boolean(phone));
  const [otp, setOtp] = useState(Array(OTP_CODE_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const formattedPhone = toOtpPhone(phoneNumber);
  
  const hasAccountPhone = Boolean(toOtpPhone(phone));

  const focusInput = (index) => {
    const next = document.getElementById(`otp-${index}`);
    if (next) {
      next.focus();
    }
  };

  const handleSend = async () => {
    if (formattedPhone.length < 10) {
      setError('Enter a valid phone number.');
      return;
    }
    if (sendInFlight.current) {
      return;
    }

    sendInFlight.current = true;
    sentForPhone.current = formattedPhone;
    setSending(true);
    setError('');
    setInfo('');

    try {
      if (onPhoneProvided && phoneNumber !== phone) {
        onPhoneProvided(phoneNumber);
      }
      await sendOtp(formattedPhone);
      setPhoneSubmitted(true);
      setOtp(Array(OTP_CODE_LENGTH).fill(''));
      setInfo(`OTP sent to ${maskPhone(formattedPhone)}.`);
      focusInput(0);
    } catch (err) {
      setError(err.message || 'Could not send OTP.');
    } finally {
      sendInFlight.current = false;
      setSending(false);
    }
  };

  useEffect(() => {
    if (!hasAccountPhone) {
      setError('No phone number on this account. Enter it below to continue.');
      return;
    }
    if (!formattedPhone) {
      setError('No phone number on this account. Add it in Profile, then try again.');
      return;
    }
    if (sentForPhone.current === formattedPhone) {
      return;
    }
    sentForPhone.current = formattedPhone;
    handleSend();
    // Send once when the popup opens for this user.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formattedPhone, hasAccountPhone]);

  const handlePhoneChange = (e) => {
    setPhoneNumber(e.target.value);
    setError('');
  };

  const handleChange = (index, value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length > 1) {
      const nextOtp = [...otp];
      digits.slice(0, OTP_CODE_LENGTH).split('').forEach((digit, offset) => {
        if (index + offset < OTP_CODE_LENGTH) {
          nextOtp[index + offset] = digit;
        }
      });
      setOtp(nextOtp);
      setError('');
      focusInput(Math.min(index + digits.length, OTP_CODE_LENGTH - 1));
      return;
    }

    const nextOtp = [...otp];
    nextOtp[index] = digits.slice(-1);
    setOtp(nextOtp);
    setError('');

    if (digits && index < OTP_CODE_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      focusInput(index - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== OTP_CODE_LENGTH) {
      setError(`Enter all ${OTP_CODE_LENGTH} digits.`);
      return;
    }

    setVerifying(true);
    setError('');

    try {
      await verifyOtp(formattedPhone, otpValue);
      onVerify(otpValue);
    } catch (err) {
      setError(err.message || 'OTP verification failed.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="otp-overlay">
      <div className="otp-popup">
        <div className="otp-header">
          <h3>Enter OTP</h3>
          <button type="button" className="close-btn" onClick={onClose}>×</button>
        </div>
        <p className="otp-hint">
          Confirm consent to use credit card transaction data. A 4-digit code will be sent to the
          phone on this account.
        </p>

        <form onSubmit={handleSubmit}>
          {!hasAccountPhone && !phoneSubmitted ? (
            <div className="otp-phone-form">
              <label htmlFor="consent-phone">Phone number</label>
              <input
                id="consent-phone"
                type="tel"
                inputMode="tel"
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChange={handlePhoneChange}
                disabled={sending || verifying}
              />
              <button
                type="button"
                className="verify-btn"
                onClick={handleSend}
                disabled={sending || verifying || formattedPhone.length < 10}
              >
                {sending ? 'Sending...' : 'Send OTP'}
              </button>
            </div>
          ) : (
            <>
              <div className="otp-inputs">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    autoComplete={index === 0 ? 'one-time-code' : 'off'}
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="otp-input"
                    disabled={verifying}
                  />
                ))}
              </div>
              {info && <p className="form-message success">{info}</p>}
              {error && <p className="form-message error">{error}</p>}
              <button type="submit" className="verify-btn" disabled={verifying || sending}>
                {verifying ? 'Verifying...' : 'Verify OTP'}
              </button>
              <button
                type="button"
                className="resend-otp-btn"
                onClick={handleSend}
                disabled={sending || verifying}
              >
                {sending ? 'Sending...' : 'Resend OTP'}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default OTPVerification;
