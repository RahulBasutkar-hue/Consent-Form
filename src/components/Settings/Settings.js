import React, { useState } from 'react';
import { FiHelpCircle, FiInfo, FiLock, FiSliders } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import FAQ from './FAQ';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Settings.css';

const SettingToggle = ({ title, description, checked, onChange }) => (
  <div className="setting-row">
    <div>
      <p className="setting-title">{title}</p>
      <p className="setting-copy">{description}</p>
    </div>
    <label className="switch">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="switch-slider" />
    </label>
  </div>
);

const Settings = () => {
  const navigate = useNavigate();
  const { settings, updateSettings, changePassword, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const handleSettingChange = (setting) => {
    updateSettings({ [setting]: !settings[setting] });
    setMessageType('success');
    setMessage('Settings updated.');
  };

  const handleLanguageChange = (e) => {
    updateSettings({ language: e.target.value });
    setMessageType('success');
    setMessage('Language updated.');
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessageType('error');
      setMessage('New passwords do not match.');
      return;
    }
    const result = changePassword(passwordForm.currentPassword, passwordForm.newPassword);
    setMessageType(result.ok ? 'success' : 'error');
    setMessage(result.message);
    if (result.ok) {
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
    }
  };

  const handleLogoutAll = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const openTab = (tab) => {
    setActiveTab(tab);
    setMessage('');
    setMessageType('success');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="settings-section">
            <div className="panel-header">
              <div>
                <h2>General</h2>
                <p>Preferences for this browser session and workspace appearance.</p>
              </div>
            </div>

            <SettingToggle
              title="Notifications"
              description="Receive in-app notices for verification and workspace events."
              checked={settings.notifications}
              onChange={() => handleSettingChange('notifications')}
            />
            <SettingToggle
              title="Dark mode"
              description="Use a darker theme across Home, Profile, and Settings."
              checked={settings.darkMode}
              onChange={() => handleSettingChange('darkMode')}
            />
            <SettingToggle
              title="Auto save"
              description="Keep local draft changes without an extra confirmation step."
              checked={settings.autoSave}
              onChange={() => handleSettingChange('autoSave')}
            />

            <div className="setting-row">
              <div>
                <label className="setting-title" htmlFor="settings-language">Language</label>
                <p className="setting-copy">Display language for workspace copy.</p>
              </div>
              <select
                id="settings-language"
                className="settings-select"
                value={settings.language}
                onChange={handleLanguageChange}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="settings-section">
            <div className="panel-header">
              <div>
                <h2>Security</h2>
                <p>Protect this account and manage credentials stored in the browser.</p>
              </div>
            </div>

            <SettingToggle
              title="Two-factor authentication"
              description="Require an extra verification step. Use the OTP flow on Home."
              checked={settings.twoFactor}
              onChange={() => handleSettingChange('twoFactor')}
            />

            <div className="setting-block">
              <div className="setting-block-head">
                <div>
                  <p className="setting-title">Password</p>
                  <p className="setting-copy">Update the password used for the next sign-in on this device.</p>
                </div>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setShowPasswordForm((open) => !open)}
                >
                  {showPasswordForm ? 'Cancel' : 'Change password'}
                </button>
              </div>
              {showPasswordForm && (
                <form className="password-form" onSubmit={handlePasswordChange}>
                  <label>
                    Current password
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      required
                    />
                  </label>
                  <label>
                    New password
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      required
                    />
                  </label>
                  <label>
                    Confirm new password
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      required
                    />
                  </label>
                  <button type="submit" className="primary-btn">Save password</button>
                </form>
              )}
            </div>

            <div className="setting-block setting-block-danger">
              <div className="setting-block-head">
                <div>
                  <p className="setting-title">End all sessions</p>
                  <p className="setting-copy">Sign out of this workspace on the current device.</p>
                </div>
                <button type="button" className="danger-btn" onClick={handleLogoutAll}>
                  Logout from all devices
                </button>
              </div>
            </div>
          </div>
        );

      case 'faq':
        return <FAQ />;

      case 'about':
        return (
          <div className="settings-section">
            <div className="panel-header">
              <div>
                <h2>About</h2>
                <p>Application details, support, and legal notices for this workspace.</p>
              </div>
            </div>

            <dl className="about-grid">
              <div>
                <dt>App version</dt>
                <dd>1.0.0</dd>
              </div>
              <div>
                <dt>Last updated</dt>
                <dd>September 2026</dd>
              </div>
              <div>
                <dt>Developer</dt>
                <dd>Your Company Name</dd>
              </div>
              <div>
                <dt>Contact</dt>
                <dd>support@yourapp.com</dd>
              </div>
            </dl>

            <div className="about-actions">
              <button type="button" className="secondary-btn" onClick={() => { setMessageType('success'); setMessage('Feedback received. Thank you!'); }}>
                Send feedback
              </button>
              <button type="button" className="secondary-btn" onClick={() => { setMessageType('success'); setMessage('Privacy policy: this demo stores data only in your browser.'); }}>
                Privacy policy
              </button>
              <button type="button" className="secondary-btn" onClick={() => { setMessageType('success'); setMessage('Terms of service: this is a local demo app.'); }}>
                Terms of service
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-page">
        <nav className="page-breadcrumb" aria-label="Breadcrumb">
          <span>Workspace</span>
          <span className="page-breadcrumb-sep">/</span>
          <span className="page-breadcrumb-current">Settings</span>
        </nav>

        <header className="settings-hero">
          <div>
            <p className="settings-kicker">Administration</p>
            <h1>Settings</h1>
            <p className="settings-subtitle">
              Manage preferences, security, and workspace information for this account.
            </p>
          </div>
        </header>

        <div className="settings-layout">
          <aside className="settings-sidebar">
            <nav className="settings-nav" aria-label="Settings sections">
              <button type="button" className={activeTab === 'general' ? 'active' : ''} onClick={() => openTab('general')}>
                <FiSliders /> General
              </button>
              <button type="button" className={activeTab === 'security' ? 'active' : ''} onClick={() => openTab('security')}>
                <FiLock /> Security
              </button>
              <button type="button" className={activeTab === 'faq' ? 'active' : ''} onClick={() => openTab('faq')}>
                <FiHelpCircle /> FAQ
              </button>
              <button type="button" className={activeTab === 'about' ? 'active' : ''} onClick={() => openTab('about')}>
                <FiInfo /> About
              </button>
            </nav>
          </aside>

          <div className="settings-main">
            {message && (
              <div className={`inline-alert ${messageType === 'error' ? 'error' : 'success'}`} role="status">
                {message}
              </div>
            )}
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
