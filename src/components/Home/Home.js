import React, { useMemo, useState } from 'react';
import { FiActivity, FiCheckCircle, FiClock, FiShield, FiUser } from 'react-icons/fi';
import OTPVerification from '../Auth/OTPVerification';
import { useAuth } from '../../context/AuthContext';
import { CONSENT_STATUS, getConsentStatus, setConsentStatus } from '../../utils/consentStore';
import '../../styles/Home.css';

const Home = () => {
  const { profile, user, updateProfile } = useAuth();
  const [showOTPPopup, setShowOTPPopup] = useState(false);
  const [snowResponse, setSnowResponse] = useState('');
  const [activity, setActivity] = useState([
    { id: 1, label: 'Session started', detail: 'Signed in to workspace', time: 'Just now' }
  ]);

  const consentUserKey = profile.username || user?.user_name || profile.email || 'demo-user';
  // TODO: Replace getConsentStatus(...) with the consent flag returned from the database after login.
  const [consentStatus, setConsentStatusState] = useState(() => getConsentStatus(consentUserKey));

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

  const handleSnowInteraction = () => {
    setSnowResponse('ServiceNow workspace acknowledged this interaction.');
    pushActivity('Workspace event', 'ServiceNow interaction recorded');
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
          <article className="panel">
            <div className="panel-header">
              <div>
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
                  This consent is only for using your <strong>credit card transaction data</strong> to
                  complete identity checks and related protected workflows, as required under the Digital
                  Personal Data Protection Act.
                </p>
              </div>

              <ul className="verify-steps">
                <li className="is-done">Sign in to the workspace</li>
                <li className={consentGiven ? 'is-done' : optedOut ? '' : 'is-current'}>
                  Give consent and verify with OTP
                </li>
                <li className={consentGiven ? 'is-current' : ''}>Continue to protected workflows</li>
              </ul>

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
                  <button type="button" className="primary-btn" onClick={() => setShowOTPPopup(true)}>
                    Give consent
                  </button>
                </div>
              ) : (
                <div className="consent-actions">
                  <button type="button" className="primary-btn" onClick={() => setShowOTPPopup(true)}>
                    Give consent
                  </button>
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => {
                      persistConsent(CONSENT_STATUS.OPTED_OUT);
                      setShowOTPPopup(false);
                      pushActivity('Consent opted out', 'Credit card transaction data will not be used');
                    }}
                  >
                    Opt-out
                  </button>
                </div>
              )}
            </div>
          </article>

          <article className="panel">
            <div className="panel-header">
              <div>
                <h2>ServiceNow workspace</h2>
                <p>Use this surface to log a demo interaction with the connected environment.</p>
              </div>
            </div>

            <button
              type="button"
              className="snow-surface"
              onClick={handleSnowInteraction}
            >
              <span className="snow-surface-title">Record interaction</span>
              <span className="snow-surface-copy">
                Click to send a workspace ping. This is a local demo event, not a production ticket.
              </span>
              {snowResponse && <span className="snow-response">{snowResponse}</span>}
            </button>
          </article>

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
          onVerify={() => {
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
