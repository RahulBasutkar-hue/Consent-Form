import React, { useState } from 'react';
import { FiCheck, FiCheckCircle, FiEdit2, FiFileText, FiHash, FiLock, FiMail, FiPhone, FiUser } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import '../../styles/MyProfile.css';

const MyProfile = () => {
  const { profile, updateProfile } = useAuth();
  const [form, setForm] = useState(profile);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');

  const handleEdit = () => {
    setForm(profile);
    setIsEditing(true);
    setMessage('');
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = () => {
    updateProfile(form);
    setIsEditing(false);
    setMessage('Profile saved.');
  };

  const handleCancel = () => {
    setForm(profile);
    setIsEditing(false);
    setMessage('');
  };

  const displayName = profile.name || profile.username || 'User';
  const initials = displayName.charAt(0).toUpperCase();
  const fieldValue = (value) => (value && String(value).trim() ? value : 'Not provided');

  const renderField = ({ id, name, label, icon: Icon, type = 'text', locked = false, wide = false }) => (
    <div className={`profile-field ${wide ? 'profile-field-wide' : ''}`} key={name}>
      <label htmlFor={isEditing && !locked ? id : undefined}>
        {Icon && <Icon aria-hidden="true" />} {label}
        {locked && <span className="field-badge">Synced from bank</span>}
      </label>
      {isEditing && !locked ? (
        type === 'textarea' ? (
          <textarea id={id} name={name} rows={4} value={form[name]} onChange={handleChange} />
        ) : (
          <input id={id} type={type} name={name} value={form[name]} onChange={handleChange} />
        )
      ) : (
        <span className={`${locked ? 'is-locked' : ''} ${profile[name] && String(profile[name]).trim() ? '' : 'is-empty'}`}>
          {fieldValue(profile[name])}
        </span>
      )}
    </div>
  );

  return (
    <div className="profile-container">
      <div className="profile-page">
        <nav className="page-breadcrumb" aria-label="Breadcrumb">
          <span>Arjun Capital</span>
          <span className="page-breadcrumb-sep">/</span>
          <span className="page-breadcrumb-current">Profile</span>
        </nav>

        <header className="page-hero">
          <div>
            <p className="page-kicker">Account</p>
            <h1>My Profile</h1>
            <p className="page-subtitle">
              View and update the details associated with your account.
            </p>
          </div>
        </header>

        {message && (
          <div className="inline-alert success profile-alert" role="status">
            <FiCheckCircle aria-hidden="true" />
            <span>{message}</span>
          </div>
        )}

        <section className="profile-layout">
          <aside className="identity-card">
            <div className="identity-cover" aria-hidden="true" />
            <div className="identity-body">
              <div className="identity-avatar">{initials}</div>
              <h2>{displayName}</h2>
              <p className="identity-username">@{profile.username || 'username'}</p>
              <span className="status-pill status-pill-live">Active</span>
              <dl className="identity-meta">
                <div>
                  <dt><FiMail aria-hidden="true" /> Email</dt>
                  <dd>{profile.email || '—'}</dd>
                </div>
                <div>
                  <dt><FiPhone aria-hidden="true" /> Phone</dt>
                  <dd>{profile.phone || '—'}</dd>
                </div>
                <div>
                  <dt><FiHash aria-hidden="true" /> Customer ID</dt>
                  <dd>{profile.username || '—'}</dd>
                </div>
              </dl>
              <p className="identity-hint">
                <FiLock aria-hidden="true" /> Username is assigned by the bank and cannot be changed here.
              </p>
            </div>
          </aside>

          <article className="panel profile-panel">
            <div className="panel-section">
              <div className="panel-header">
                <div className="panel-title">
                  <span className="panel-title-icon"><FiUser aria-hidden="true" /></span>
                  <div>
                    <h2>Personal information</h2>
                    <p>These details are used when the bank contacts you about your account and offers.</p>
                  </div>
                </div>
                {!isEditing && (
                  <button type="button" onClick={handleEdit} className="secondary-btn">
                    <FiEdit2 aria-hidden="true" /> Edit profile
                  </button>
                )}
              </div>
            </div>

            <div className="panel-section">
              <div className="profile-fields">
                {renderField({ id: 'profile-name', name: 'name', label: 'Full name', icon: FiUser })}
                {renderField({ id: 'profile-username', name: 'username', label: 'Username', icon: FiLock, locked: true })}
                {renderField({ id: 'profile-email', name: 'email', label: 'Email', icon: FiMail, type: 'email' })}
                {renderField({ id: 'profile-phone', name: 'phone', label: 'Phone', icon: FiPhone, type: 'tel' })}
                {renderField({ id: 'profile-bio', name: 'bio', label: 'Bio', icon: FiFileText, type: 'textarea', wide: true })}
              </div>
            </div>

            {isEditing && (
              <div className="panel-section panel-footer profile-actions">
                <span className="profile-editing-note">
                  <span className="status-pill status-pill-pending">Editing</span>
                  Changes are saved to this device.
                </span>
                <div className="profile-actions-buttons">
                  <button type="button" onClick={handleCancel} className="secondary-btn">Cancel</button>
                  <button type="button" onClick={handleSave} className="primary-btn">
                    <FiCheck aria-hidden="true" /> Save changes
                  </button>
                </div>
              </div>
            )}
          </article>
        </section>
      </div>
    </div>
  );
};

export default MyProfile;
