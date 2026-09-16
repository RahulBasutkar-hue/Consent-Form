import React, { useState, useRef } from 'react';
import { getAuth, signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";
import { auth } from '../firebase';
import './OTPConsent.css';

const OTPConsent = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // phone, otp, verified
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [consentChecked, setConsentChecked] = useState(false);
  const recaptchaVerifierRef = useRef(null);
  const confirmationResultRef = useRef(null);

  // Initialize reCAPTCHA
  const setupRecaptcha = () => {
    if (!recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current = new RecaptchaVerifier(
        'recaptcha-container',
        {
          size: 'normal',
          callback: () => console.log('reCAPTCHA verified'),
          'expired-callback': () => console.log('reCAPTCHA expired'),
        },
        auth
      );
    }
  };

  // Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');

    if (!consentChecked) {
      setError('Please accept the consent');
      return;
    }

    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Enter a valid phone number');
      return;
    }

    setLoading(true);

    try {
      setupRecaptcha();
      
      // Format phone number (add country code if needed)
      const formattedPhone = phoneNumber.startsWith('+') 
        ? phoneNumber 
        : `+91${phoneNumber}`; // Change 91 to your country code

      const result = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        recaptchaVerifierRef.current
      );

      confirmationResultRef.current = result;
      setStep('otp');
      setError('');
      console.log('OTP sent successfully');
    } catch (err) {
      setError(err.message);
      console.error('Error sending OTP:', err);
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.length < 6) {
      setError('Enter a valid OTP');
      return;
    }

    setLoading(true);

    try {
      await confirmationResultRef.current.confirm(otp);
      setStep('verified');
      setError('');
      console.log('User verified successfully');
      // You can now save user data or redirect
    } catch (err) {
      setError('Invalid OTP. Please try again.');
      console.error('Error verifying OTP:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="otp-container">
      <div className="otp-box">
        <h1>User Consent & Verification</h1>

        {/* Phone Number Step */}
        {step === 'phone' && (
          <form onSubmit={handleSendOTP} className="otp-form">
            <div className="consent-checkbox">
              <input
                type="checkbox"
                id="consent"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
              />
              <label htmlFor="consent">
                I agree to the terms and conditions and consent to receive OTP via SMS
              </label>
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                placeholder="Enter phone number (10 digits)"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={loading}
                maxLength="10"
              />
            </div>

            <div id="recaptcha-container"></div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}

        {/* OTP Verification Step */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP} className="otp-form">
            <p className="info-text">
              OTP sent to <strong>+91{phoneNumber}</strong>
            </p>

            <div className="form-group">
              <label>Enter OTP</label>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                disabled={loading}
                maxLength="6"
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('phone');
                setOtp('');
              }}
              className="btn-secondary"
            >
              Change Phone Number
            </button>
          </form>
        )}

        {/* Success Step */}
        {step === 'verified' && (
          <div className="success-message">
            <h2>✓ Verification Successful!</h2>
            <p>Phone: +91{phoneNumber}</p>
            <p>You have successfully consented and verified your account.</p>
            <button onClick={() => window.location.reload()} className="btn-primary">
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OTPConsent;