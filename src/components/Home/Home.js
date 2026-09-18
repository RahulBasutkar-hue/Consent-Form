import React, { useMemo, useState } from 'react';
import { FiActivity, FiCheckCircle, FiClock, FiCreditCard, FiShield, FiUser } from 'react-icons/fi';
import OTPVerification from '../Auth/OTPVerification';
import { useAuth } from '../../context/AuthContext';
import { CONSENT_STATUS, getConsentStatus, setConsentStatus } from '../../utils/consentStore';
import {
  getCardOfferInterestSent,
  setCardOfferInterestSent,
  submitCardOfferInterest
} from '../../utils/cardInterest';
import '../../styles/Home.css';

const Home = () => {
  const { profile, user, updateProfile, updateConsent } = useAuth();
  const [showOTPPopup, setShowOTPPopup] = useState(false);
  const [consentUpdating, setConsentUpdating] = useState(false);
  const [consentError, setConsentError] = useState('');
  const [activity, setActivity] = useState([
    { id: 1, label: 'Session started', detail: 'Signed in to workspace', time: 'Just now' }
  ]);

  const consentUserKey = profile.username || user?.user_name || profile.email || 'demo-user';
  // TODO: Replace getConsentStatus(...) with the consent flag returned from the database after login.
  const [consentStatus, setConsentStatusState] = useState(() => getConsentStatus(consentUserKey));
  const [offerInterestSent, setOfferInterestSent] = useState(() => getCardOfferInterestSent(consentUserKey));
  const [offerInterestUpdating, setOfferInterestUpdating] = useState(false);
  const [offerInterestError, setOfferInterestError] = useState('');

  const persistConsent = (status) => {
    // TODO: Replace setConsentStatus(...) with an API/DB write for this user's DPDP consent.
    setConsentStatus(consentUserKey, status);
    setConsentStatusState(status);
  };

  const consentGiven = consentStatus === CONSENT_STATUS.GIVEN;
  const optedOut = consentStatus === CONSENT_STATUS.OPTED_OUT;

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const displayName = profile.name || profile.username || 'User';

  const pushActivity = (label, detail) => {
    setActivity((current) => [
      { id: Date.now(), label, detail, time: 'Just now' },
      ...current
    ].slice(0, 5));
  };

  const handleCardOfferInterest = async () => {
    if (!consentGiven) {
      return;
    }

    setOfferInterestUpdating(true);
    setOfferInterestError('');
    try {
      const result = await submitCardOfferInterest({
        sys_id: user?.sys_id,
        user_name: profile.username || user?.user_name,
        email: profile.email || user?.email,
        name: displayName,
        intent: 'credit_card_offers'
      });

      if (!result?.ok) {
        throw new Error(result?.message || 'Could not record your interest. Try again.');
      }

      setCardOfferInterestSent(consentUserKey, true);
      setOfferInterestSent(true);
      pushActivity('Card offers', 'Interest recorded for credit card offers');
    } catch (error) {
      setOfferInterestError(error.message || 'Could not record your interest. Try again.');
    } finally {
      setOfferInterestUpdating(false);
    }
  };

  const handleOptOut = async () => {
    setConsentUpdating(true);
    setConsentError('');
    try {
      await updateConsent(false);
      persistConsent(CONSENT_STATUS.OPTED_OUT);
      setShowOTPPopup(false);
      pushActivity('Consent opted out', 'Credit card transaction data will not be used');
    } catch (error) {
      setConsentError(error.message || 'Could not update consent. Try again.');
    } finally {
      setConsentUpdating(false);
    }
  };

  return (
    <div className="home-container">
      <div className="home-page">
        <nav className="page-breadcrumb" aria-label="Breadcrumb">
          <span>Workspace</span>
          <span className="page-breadcrumb-sep">/</span>
          <span className="page-breadcrumb-current">Home</span>
        </nav>

        <header className="home-hero">
          <div>
            <p className="home-kicker">{greeting}</p>
            <h1>Welcome back, {displayName}</h1>
            <p className="home-subtitle">
              Review account status, complete identity checks, and continue your ServiceNow work from one place.
            </p>
          </div>
          <div className="home-hero-meta">
            <span className="status-pill status-pill-live">Active session</span>
            <span className="home-hero-time">{new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          </div>
        </header>

        <section className="home-metrics" aria-label="Account summary">
          <article className="metric-card">
            <div className="metric-icon metric-icon-user">
              <FiUser />
            </div>
            <div>
              <p className="metric-label">Signed-in user</p>
              <p className="metric-value">{displayName}</p>
              <p className="metric-hint">{profile.email || profile.username || 'Authenticated account'}</p>
            </div>
          </article>

          <article className="metric-card">
            <div className={`metric-icon ${consentGiven ? 'metric-icon-ok' : optedOut ? 'metric-icon-muted' : 'metric-icon-warn'}`}>
              {consentGiven ? <FiCheckCircle /> : <FiShield />}
            </div>
            <div>
              <p className="metric-label">Identity verification</p>
              <p className="metric-value">{consentGiven ? 'Verified' : optedOut ? 'Opted out' : 'Pending'}</p>
              <p className="metric-hint">
                {consentGiven
                  ? 'Consent given and OTP verified'
                  : optedOut
                    ? 'Transaction data will not be used'
                    : 'Consent required under DPDP Act'}
              </p>
            </div>
          </article>

          <article className="metric-card">
            <div className="metric-icon metric-icon-activity">
              <FiActivity />
            </div>
            <div>
              <p className="metric-label">Workspace events</p>
              <p className="metric-value">{activity.length}</p>
              <p className="metric-hint">Recent actions in this session</p>
            </div>
          </article>
        </section>

        <section className="home-grid">
          <article className="panel panel-wide verification-panel">
            <div className="panel-header">
              <div className="verification-header-copy">
                <h2>Identity verification</h2>
                <p>
                  Consent to use your credit card transaction data, then confirm with a one-time passcode.
                </p>
              </div>
              <span
                className={`status-pill ${
                  consentGiven ? 'status-pill-ok' : optedOut ? 'status-pill-neutral' : 'status-pill-pending'
                }`}
              >
                {consentGiven ? 'Already verified' : optedOut ? 'Opted out' : 'Action needed'}
              </span>
            </div>

            <div className="verify-body">
              <div className="consent-notice">
                <p className="consent-kicker">DPDP Act, 2023</p>
                <p>
                  This consent is limited to the use of your <strong>credit card transaction data</strong>
                  solely for identity verification, fraud screening, and related protected workflows as
                  permitted under the Digital Personal Data Protection Act, 2023. Your data will be used
                  only for the stated verification purpose, retained only as long as necessary, and not
                  processed for unrelated marketing, profiling, or secondary use without your additional
                  consent.
                </p>
              </div>

              {consentGiven ? (
                <div className="inline-alert success" role="status">
                  Already verified. Consent is given to use your credit card transaction data.
                </div>
              ) : optedOut ? (
                <div className="consent-optout-block">
                  <div className="inline-alert muted" role="status">
                    You opted out. We will not use your credit card transaction data, and OTP verification
                    will not be requested.
                  </div>
                  <div className="consent-actions">
                    <button type="button" className="primary-btn" onClick={() => setShowOTPPopup(true)} disabled={consentUpdating}>
                      Give consent
                    </button>
                    <button type="button" className="secondary-btn" onClick={handleOptOut} disabled={consentUpdating}>
                      {consentUpdating ? 'Updating...' : 'Opt-out'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="consent-actions consent-actions-bottom">
                  <button type="button" className="primary-btn" onClick={() => setShowOTPPopup(true)}>
                    Give consent
                  </button>
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={handleOptOut}
                    disabled={consentUpdating}
                  >
                    {consentUpdating ? 'Updating...' : 'Opt-out'}
                  </button>
                </div>
              )}
              {consentError && <p className="form-message error consent-error" role="alert">{consentError}</p>}
            </div>
          </article>

          {consentGiven && (
          <article className="panel panel-wide offers-panel">
            <div className="panel-header">
              <div className="offers-header-copy">
                <h2>Credit card offers</h2>
                <p>
                  Tell us you want to know about cards available for you. We’ll raise a request with the team.
                </p>
              </div>
              <span className={`status-pill ${offerInterestSent ? 'status-pill-ok' : 'status-pill-pending'}`}>
                {offerInterestSent ? 'Request sent' : 'Available'}
              </span>
            </div>

            {offerInterestSent ? (
              <div className="inline-alert success" role="status">
                We’ve recorded your interest. Someone will follow up with card offers.
              </div>
            ) : (
              <div className="offers-body">
                <div className="offers-copy">
                  <div className="metric-icon metric-icon-offers">
                    <FiCreditCard />
                  </div>
                  <p>
                    This is not an application. It only lets the team know you want to hear about offers.
                  </p>
                </div>
                <button
                  type="button"
                  className="primary-btn"
                  onClick={handleCardOfferInterest}
                  disabled={offerInterestUpdating}
                >
                  {offerInterestUpdating ? 'Sending...' : 'Know my card offers'}
                </button>
              </div>
            )}
            {offerInterestError && (
              <p className="form-message error consent-error" role="alert">{offerInterestError}</p>
            )}
          </article>
          )}

          <article className="panel panel-wide">
            <div className="panel-header">
              <div>
                <h2>Recent activity</h2>
                <p>A short audit trail for this browser session.</p>
              </div>
            </div>
            <ul className="activity-list">
              {activity.map((item) => (
                <li key={item.id}>
                  <span className="activity-icon"><FiClock /></span>
                  <div>
                    <p className="activity-label">{item.label}</p>
                    <p className="activity-detail">{item.detail}</p>
                  </div>
                  <time>{item.time}</time>
                </li>
              ))}
            </ul>
          </article>
        </section>
      </div>

      {showOTPPopup && (
        <OTPVerification
          phone={profile.phone || user?.mobile_phone || user?.phone || ''}
          onPhoneProvided={(phone) => updateProfile({ phone })}
          onClose={() => setShowOTPPopup(false)}
          onVerify={async () => {
            await updateConsent(true);
            persistConsent(CONSENT_STATUS.GIVEN);
            pushActivity('Consent given', 'OTP verified for credit card transaction data');
            setShowOTPPopup(false);
          }}
        />
      )}
    </div>
  );
};

export default Home;
