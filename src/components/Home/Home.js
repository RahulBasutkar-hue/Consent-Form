import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiAlertCircle,
  FiArrowRight,
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiCreditCard,
  FiFileText,
  FiHelpCircle,
  FiInfo,
  FiLock,
  FiPhoneCall,
  FiShield,
  FiUser,
  FiX
} from 'react-icons/fi';
import OTPVerification from '../Auth/OTPVerification';
import { useAuth } from '../../context/AuthContext';
import { CONSENT_STATUS, getConsentStatus, setConsentStatus } from '../../utils/consentStore';
import {
  addInterestedCardKey,
  getCardKey,
  getCardOfferInterestSent,
  getInterestedCardKeys,
  setCardOfferInterestSent
} from '../../utils/cardInterest';
import '../../styles/Home.css';

const Home = () => {
  const { profile, user, updateProfile, updateConsent, getAvailableCards, updateOfferInterest } = useAuth();
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
  const [interestCardKey, setInterestCardKey] = useState('');
  const [interestedCardKeys, setInterestedCardKeys] = useState(() => getInterestedCardKeys(consentUserKey));
  const [offerInterestError, setOfferInterestError] = useState('');
  const [availableCards, setAvailableCards] = useState([]);
  const [cardsLoading, setCardsLoading] = useState(false);
  const [cardsError, setCardsError] = useState('');
  const cardScrollerRef = useRef(null);
  const [cardScroll, setCardScroll] = useState({ atStart: true, atEnd: true });

  const persistConsent = (status) => {
    // TODO: Replace setConsentStatus(...) with an API/DB write for this user's DPDP consent.
    setConsentStatus(consentUserKey, status);
    setConsentStatusState(status);
  };

  const consentGiven = consentStatus === CONSENT_STATUS.GIVEN;
  const optedOut = consentStatus === CONSENT_STATUS.OPTED_OUT;
  // Horizontal card carousel: track whether we can scroll further either way.
  const updateCardScroll = useCallback(() => {
    const el = cardScrollerRef.current;
    if (!el) return;
    setCardScroll({
      atStart: el.scrollLeft <= 4,
      atEnd: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4
    });
  }, []);

  const scrollCards = (direction) => {
    const el = cardScrollerRef.current;
    if (!el) return;
    const firstCard = el.querySelector('.card-offer-item');
    const step = firstCard ? firstCard.getBoundingClientRect().width + 20 : el.clientWidth * 0.8;
    el.scrollBy({ left: direction * step, behavior: 'smooth' });
  };

  useEffect(() => {
    updateCardScroll();
    window.addEventListener('resize', updateCardScroll);
    return () => window.removeEventListener('resize', updateCardScroll);
  }, [availableCards, cardsLoading, updateCardScroll]);

  useEffect(() => {
    if (!consentGiven) {
      setAvailableCards([]);
      setCardsError('');
      return undefined;
    }

    let cancelled = false;
    setCardsLoading(true);
    setCardsError('');

    getAvailableCards()
      .then((cards) => {
        if (!cancelled) {
          setAvailableCards(cards);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setCardsError(error.message || 'Could not load available cards.');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setCardsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [consentGiven, getAvailableCards]);

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

  const handleCardOfferInterest = async (card) => {
    if (!consentGiven || offerInterestUpdating) {
      return;
    }

    const cardKey = getCardKey(card);
    setOfferInterestUpdating(true);
    setInterestCardKey(cardKey);
    setOfferInterestError('');
    try {
      // Same ServiceNow call as before (needs_offer_details: true).
      await updateOfferInterest();

      setCardOfferInterestSent(consentUserKey, true);
      setOfferInterestSent(true);
      addInterestedCardKey(consentUserKey, cardKey);
      setInterestedCardKeys((current) => (current.includes(cardKey) ? current : [...current, cardKey]));
      pushActivity('Card offers', `Interest recorded for ${card?.cardName || 'a credit card'}`);
    } catch (error) {
      setOfferInterestError(
        `${card?.cardName ? `${card.cardName}: ` : ''}${error.message || 'Could not record your interest. Try again.'}`
      );
    } finally {
      setOfferInterestUpdating(false);
      setInterestCardKey('');
    }
  };

  const interestedCardNames = availableCards
    .filter((card) => interestedCardKeys.includes(getCardKey(card)))
    .map((card) => card.cardName);

  const handleOptOut = async () => {
    setConsentUpdating(true);
    setConsentError('');
    try {
      await updateConsent(false);
      persistConsent(CONSENT_STATUS.OPTED_OUT);
      setShowOTPPopup(false);
      pushActivity('Consent opted out', 'Transaction data will not be used');
    } catch (error) {
      setConsentError(error.message || 'Could not update consent. Try again.');
    } finally {
      setConsentUpdating(false);
    }
  };

  const consentLabel = consentGiven ? 'Consent active' : optedOut ? 'Opted out' : 'Action needed';
  const consentPill = consentGiven ? 'status-pill-ok' : optedOut ? 'status-pill-neutral' : 'status-pill-pending';
  const consentSteps = ['Review notice', 'Verify with OTP', 'Consent active'];
  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="home-container">
      <div className="home-page">
        <nav className="page-breadcrumb" aria-label="Breadcrumb">
          <span>Arjun Capital</span>
          <span className="page-breadcrumb-sep">/</span>
          <span className="page-breadcrumb-current">Overview</span>
        </nav>

        <header className="page-hero home-hero">
          <div>
            <p className="page-kicker">{greeting}</p>
            <h1>Welcome back, {displayName}</h1>
            <p className="page-subtitle">
              Manage how your transaction data is used and explore offers available to you.
            </p>
          </div>
          <div className="home-hero-meta">
            <span className="home-hero-date">
              <FiCalendar aria-hidden="true" /> {todayLabel}
            </span>
          </div>
        </header>

        <section className="home-metrics" aria-label="Account summary">
          <article className="metric-card">
            <div className="metric-icon metric-icon-user">
              <FiUser />
            </div>
            <div className="metric-body">
              <p className="metric-label">Account holder</p>
              <p className="metric-value">{displayName}</p>
              <p className="metric-hint">{profile.email || profile.username || 'Authenticated account'}</p>
            </div>
          </article>

          <article className={`metric-card metric-card-status ${consentGiven ? 'is-ok' : optedOut ? 'is-muted' : 'is-warn'}`}>
            <div className={`metric-icon ${consentGiven ? 'metric-icon-ok' : optedOut ? 'metric-icon-muted' : 'metric-icon-warn'}`}>
              {consentGiven ? <FiCheckCircle /> : <FiShield />}
            </div>
            <div className="metric-body">
              <p className="metric-label">Consent status</p>
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
            <div className="metric-icon metric-icon-offers">
              <FiCreditCard />
            </div>
            <div className="metric-body">
              <p className="metric-label">Card offers</p>
              <p className="metric-value tabular">
                {consentGiven ? (cardsLoading ? '—' : availableCards.length) : <FiLock className="metric-lock" aria-label="Locked" />}
              </p>
              <p className="metric-hint">
                {consentGiven
                  ? offerInterestSent ? 'Request sent to the bank' : 'Available for you'
                  : 'Unlocks after consent'}
              </p>
            </div>
          </article>
        </section>

        <div className="home-layout">
          <div className="home-main">
            <article className="panel verification-panel">
              <div className="panel-section">
                <div className="panel-header">
                  <div className="panel-title">
                    <span className="panel-title-icon"><FiShield aria-hidden="true" /></span>
                    <div>
                      <h2>Data consent</h2>
                      <p>Consent to use your transaction data, then confirm with a one-time passcode.</p>
                    </div>
                  </div>
                  <span className={`status-pill ${consentPill}`}>{consentLabel}</span>
                </div>

                <ol className={`consent-steps ${optedOut ? 'is-muted' : ''}`} aria-label="Consent progress">
                  {consentSteps.map((step, index) => {
                    const state = consentGiven ? 'done' : index === 0 && !optedOut ? 'current' : 'upcoming';
                    return (
                      <li key={step} className={`consent-step consent-step-${state}`}>
                        <span className="consent-step-dot">
                          {state === 'done' ? <FiCheck aria-hidden="true" /> : index + 1}
                        </span>
                        <span className="consent-step-label">{step}</span>
                      </li>
                    );
                  })}
                </ol>
              </div>

              <div className="panel-section consent-notice">
                <p className="consent-kicker">
                  <FiFileText aria-hidden="true" /> Digital Personal Data Protection Act, 2023
                </p>
                <div className="consent-columns">
                  <div className="consent-col consent-col-use">
                    <p className="consent-col-title">How we use it</p>
                    <ul>
                      <li><FiCheck aria-hidden="true" /> Identity verification</li>
                      <li><FiCheck aria-hidden="true" /> Fraud screening</li>
                      <li><FiCheck aria-hidden="true" /> Related protected workflows</li>
                    </ul>
                  </div>
                  <div className="consent-col consent-col-never">
                    <p className="consent-col-title">What we don’t do</p>
                    <ul>
                      <li><FiX aria-hidden="true" /> Unrelated marketing or profiling</li>
                      <li><FiX aria-hidden="true" /> Secondary use without your additional consent</li>
                      <li><FiX aria-hidden="true" /> Keep it longer than necessary</li>
                    </ul>
                  </div>
                </div>
                <details className="consent-fulltext">
                  <summary>Read the full consent notice</summary>
                  <p>
                    This consent is limited to the use of your <strong>transaction data</strong>{' '}
                    solely for identity verification, fraud screening, and related protected workflows as
                    permitted under the Digital Personal Data Protection Act, 2023. Your data will be used
                    only for the stated verification purpose, retained only as long as necessary, and not
                    processed for unrelated marketing, profiling, or secondary use without your additional
                    consent.
                  </p>
                </details>
              </div>

              <div className="panel-section panel-footer verify-body">
                {consentGiven ? (
                  <div className="inline-alert success" role="status">
                    <FiCheckCircle aria-hidden="true" />
                    <span>Already verified. Consent is given to use your transaction data.</span>
                  </div>
                ) : optedOut ? (
                  <div className="consent-optout-block">
                    <div className="inline-alert muted" role="status">
                      <FiInfo aria-hidden="true" />
                      <span>
                        You opted out. We will not use your transaction data, and OTP verification
                        will not be requested.
                      </span>
                    </div>
                    <div className="consent-actions">
                      <button type="button" className="primary-btn" onClick={() => setShowOTPPopup(true)} disabled={consentUpdating}>
                        <FiShield aria-hidden="true" /> Give consent
                      </button>
                      <button type="button" className="secondary-btn" onClick={handleOptOut} disabled={consentUpdating}>
                        {consentUpdating ? 'Updating...' : 'Opt-out'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="consent-actions consent-actions-bottom">
                    <p className="consent-actions-hint">
                      A 4-digit code will be sent to your registered mobile number.
                    </p>
                    <div className="consent-actions-buttons">
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={handleOptOut}
                        disabled={consentUpdating}
                      >
                        {consentUpdating ? 'Updating...' : 'Opt-out'}
                      </button>
                      <button type="button" className="primary-btn" onClick={() => setShowOTPPopup(true)}>
                        <FiShield aria-hidden="true" /> Give consent
                      </button>
                    </div>
                  </div>
                )}
                {consentError && (
                  <div className="inline-alert error consent-error" role="alert">
                    <FiAlertCircle aria-hidden="true" />
                    <span>{consentError}</span>
                  </div>
                )}
              </div>
            </article>

            {consentGiven && (
            <article className="panel offers-panel">
              <div className="panel-section">
                <div className="panel-header">
                  <div className="panel-title">
                    <span className="panel-title-icon"><FiCreditCard aria-hidden="true" /></span>
                    <div>
                      <h2>Credit card offers</h2>
                      <p>
                        Tell us you want to know about cards available for you. We’ll raise a request with the team.
                      </p>
                    </div>
                  </div>
                  <span className={`status-pill ${offerInterestSent ? 'status-pill-ok' : 'status-pill-neutral'}`}>
                    {offerInterestSent ? 'Request sent' : 'Available'}
                  </span>
                </div>
              </div>

              <div className="panel-section available-cards" aria-live="polite">
                <div className="available-cards-heading">
                  <div>
                    <h3>Available credit cards</h3>
                    <span className="available-cards-count">
                      {cardsLoading ? 'Loading...' : `${availableCards.length} cards`}
                    </span>
                  </div>
                  {!cardsLoading && !cardsError && availableCards.length > 1 && !(cardScroll.atStart && cardScroll.atEnd) && (
                    <div className="card-pager">
                      <button
                        type="button"
                        className="card-repeater-arrow"
                        onClick={() => scrollCards(-1)}
                        disabled={cardScroll.atStart}
                        aria-label="Scroll to previous cards"
                      >
                        <FiChevronLeft aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className="card-repeater-arrow"
                        onClick={() => scrollCards(1)}
                        disabled={cardScroll.atEnd}
                        aria-label="Scroll to more cards"
                      >
                        <FiChevronRight aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </div>

                {cardsLoading && (
                  <div className="card-offer-grid" aria-label="Loading the latest card offers">
                    {[0, 1].map((n) => (
                      <div className="card-offer-item card-skeleton" key={n}>
                        <div className="skeleton skeleton-card" />
                        <div className="skeleton skeleton-line" />
                        <div className="skeleton skeleton-line short" />
                      </div>
                    ))}
                  </div>
                )}
                {cardsError && (
                  <div className="inline-alert error" role="alert">
                    <FiAlertCircle aria-hidden="true" />
                    <span>{cardsError}</span>
                  </div>
                )}
                {!cardsLoading && !cardsError && availableCards.length === 0 && (
                  <div className="cards-empty">
                    <FiCreditCard aria-hidden="true" />
                    <p>No card offers are available right now.</p>
                  </div>
                )}
                {!cardsLoading && !cardsError && availableCards.length > 0 && (
                  <div
                    className={`card-scroller-wrap ${cardScroll.atStart ? '' : 'fade-left'} ${cardScroll.atEnd ? '' : 'fade-right'}`}
                  >
                  <div
                    className="card-scroller"
                    ref={cardScrollerRef}
                    onScroll={updateCardScroll}
                    tabIndex={0}
                    role="region"
                    aria-label="Available credit cards, scroll horizontally"
                  >
                    {availableCards.map((card, index) => {
                      const cardNumber = `4532 **** **** ${String(1048 + index * 137).slice(-4)}`;
                      const cardTheme = `card-offer-theme-${index % 4}`;
                      return (
                        <div className="card-offer-item" key={`${card.cardName}-${card.category}`}>
                          <article className={`card-offer ${cardTheme}`}>
                            <div className="card-offer-topline">
                              <span className="card-offer-bank">ARJUN CAPITAL</span>
                              <span className="card-offer-contactless" aria-hidden="true">)))</span>
                            </div>
                            <span className="card-offer-chip" aria-hidden="true" />
                            <p className="card-offer-number">{cardNumber}</p>
                            <div className="card-offer-bottom">
                              <span className="card-offer-category">{card.category}</span>
                              <strong>{index % 2 === 0 ? 'VISA' : 'WORLD'}</strong>
                            </div>
                          </article>
                          <div className="card-offer-details">
                            <h4>{card.cardName}</h4>
                            <div className="card-offer-score">
                              <span>Recommended credit score</span>
                              <strong className="tabular">{card.creditScoreRequired}+</strong>
                            </div>
                            {(() => {
                              const cardKey = getCardKey(card);
                              const isSent = interestedCardKeys.includes(cardKey);
                              const isSending = offerInterestUpdating && interestCardKey === cardKey;
                              return (
                                <button
                                  type="button"
                                  className={`card-interest-btn ${isSent ? 'is-sent' : ''}`}
                                  onClick={() => handleCardOfferInterest(card)}
                                  disabled={isSent || offerInterestUpdating}
                                  aria-label={isSent ? `Interest sent for ${card.cardName}` : `I'm interested in ${card.cardName}`}
                                >
                                  {isSent ? (
                                    <><FiCheck aria-hidden="true" /> Request sent</>
                                  ) : isSending ? (
                                    <><span className="btn-spinner btn-spinner-dark" aria-hidden="true" /> Sending...</>
                                  ) : (
                                    <><FiPhoneCall aria-hidden="true" /> I'm interested</>
                                  )}
                                </button>
                              );
                            })()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  </div>
                )}
                {!cardsLoading && !cardsError && availableCards.length > 1 && !(cardScroll.atStart && cardScroll.atEnd) && (
                  <p className="card-scroll-hint">Swipe or scroll sideways to see all {availableCards.length} cards</p>
                )}
              </div>

              <div className="panel-section panel-footer">
                {offerInterestSent ? (
                  <div className="inline-alert success" role="status">
                    <FiCheckCircle aria-hidden="true" />
                    <span>
                      {interestedCardNames.length > 0 ? (
                        <>
                          We’ve shared your interest in <strong>{interestedCardNames.join(', ')}</strong>.{' '}
                        </>
                      ) : null}
                      Someone from the bank will connect shortly with the best offers for you.
                    </span>
                  </div>
                ) : (
                  <p className="consent-actions-hint offers-hint">
                    <FiPhoneCall aria-hidden="true" /> Tap <strong>I’m interested</strong> on any card and our team will call you with details.
                  </p>
                )}
                {offerInterestError && (
                  <div className="inline-alert error consent-error" role="alert">
                    <FiAlertCircle aria-hidden="true" />
                    <span>{offerInterestError}</span>
                  </div>
                )}
              </div>
            </article>
            )}
          </div>

          <aside className="home-aside">
            <article className="panel activity-panel">
              <div className="panel-section">
                <div className="panel-header">
                  <div>
                    <h2>Recent activity</h2>
                    <p>This browser session</p>
                  </div>
                  <span className="activity-count tabular">{activity.length}</span>
                </div>
              </div>
              <ul className="activity-list">
                {activity.map((item) => (
                  <li key={item.id}>
                    <span className="activity-icon"><FiClock aria-hidden="true" /></span>
                    <div className="activity-text">
                      <p className="activity-label">{item.label}</p>
                      <p className="activity-detail">{item.detail}</p>
                    </div>
                    <time>{item.time}</time>
                  </li>
                ))}
              </ul>
            </article>

            <article className="panel help-card">
              <span className="panel-title-icon"><FiHelpCircle aria-hidden="true" /></span>
              <div>
                <h3>Questions about consent?</h3>
                <p>Read how your data is handled and what opting out means.</p>
                <Link to="/settings" state={{ tab: 'faq' }} className="help-link">
                  View FAQs <FiArrowRight aria-hidden="true" />
                </Link>
              </div>
            </article>
          </aside>
        </div>
      </div>

      {showOTPPopup && (
        <OTPVerification
          phone={profile.phone || user?.mobile_phone || user?.phone || ''}
          onPhoneProvided={(phone) => updateProfile({ phone })}
          onClose={() => setShowOTPPopup(false)}
          onVerify={async () => {
            await updateConsent(true);
            persistConsent(CONSENT_STATUS.GIVEN);
            pushActivity('Consent given', 'OTP verified for transaction data');
            setShowOTPPopup(false);
          }}
        />
      )}
    </div>
  );
};

export default Home;
