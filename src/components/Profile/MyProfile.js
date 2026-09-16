import React, { useState } from 'react';
import { FiLock, FiMail, FiPhone, FiUser } from 'react-icons/fi';
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

  return (
    <div className="profile-container">
      <div className="profile-page">
        <nav className="page-breadcrumb" aria-label="Breadcrumb">
          <span>Workspace</span>
          <span className="page-breadcrumb-sep">/</span>
          <span className="page-breadcrumb-current">Profile</span>
        </nav>

        <header className="profile-hero">
          <div>
            <p className="profile-kicker">Account</p>
            <h1>My Profile</h1>
            <p className="profile-subtitle">
              View and update the details associated with this workspace account.
            </p>
          </div>
          <div className="profile-hero-actions">
            {isEditing ? (
              <>
                <button type="button" onClick={handleCancel} className="secondary-btn">Cancel</button>
                <button type="button" onClick={handleSave} className="primary-btn">Save changes</button>
              </>
            ) : (
              <button type="button" onClick={handleEdit} className="primary-btn">Edit profile</button>
            )}
          </div>
        </header>

        {message && (
          <div className="inline-alert success" role="status">
            {message}
          </div>
        )}

        <section className="profile-layout">
          <aside className="identity-card">
            <div className="identity-avatar">{initials}</div>
            <h2>{displayName}</h2>
            <p className="identity-username">@{profile.username || 'username'}</p>
            <dl className="identity-meta">
              <div>
                <dt>Status</dt>
                <dd>
                  <span className="status-pill status-pill-live">Active</span>
                </dd>
              </div>
              <div>
                <dt>Directory ID</dt>
                <dd>{profile.username || '—'}</dd>
              </div>
            </dl>
            <p className="identity-hint">Username is assigned by the identity source and cannot be changed here.</p>
          </aside>

          <article className="profile-panel">
            <div className="panel-header">
              <div>
                <h2>Personal information</h2>
                <p>These details appear across the workspace and in ServiceNow-connected sessions.</p>
              </div>
              <span className={`status-pill ${isEditing ? 'status-pill-pending' : 'status-pill-ok'}`}>
                {isEditing ? 'Editing' : 'Read only'}
              </span>
            </div>

            <div className="profile-fields">
              <div className="profile-field">
                <label htmlFor="profile-name">
                  <FiUser /> Full name
                </label>
                {isEditing ? (
                  <input
                    id="profile-name"
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                  />
                ) : (
                  <span>{fieldValue(profile.name)}</span>
                )}
              </div>

              <div className="profile-field">
                <label>
                  <FiLock /> Username
                </label>
                <span className="is-locked">{fieldValue(profile.username)}</span>
              </div>

              <div className="profile-field">
                <label htmlFor="profile-email">
                  <FiMail /> Email
                </label>
                {isEditing ? (
                  <input
                    id="profile-email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                  />
                ) : (
                  <span>{fieldValue(profile.email)}</span>
                )}
              </div>

              <div className="profile-field">
                <label htmlFor="profile-phone">
                  <FiPhone /> Phone
                </label>
                {isEditing ? (
                  <input
                    id="profile-phone"
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                  />
                ) : (
                  <span>{fieldValue(profile.phone)}</span>
                )}
              </div>

              <div className="profile-field profile-field-wide">
                <label htmlFor="profile-bio">Bio</label>
                {isEditing ? (
                  <textarea
                    id="profile-bio"
                    name="bio"
                    rows={4}
                    value={form.bio}
                    onChange={handleChange}
                  />
                ) : (
                  <span>{fieldValue(profile.bio)}</span>
                )}
              </div>
            </div>
          </article>
        </section>
      </div>
    </div>
  );
};

export default MyProfile;
