import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff, FiLock, FiShield, FiSmartphone, FiUser, FiUserCheck } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setError('');
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.username, formData.password);

    if (!result.ok) {
      setError(result.message);
      setLoading(false);
      return;
    }

    navigate('/home', { replace: true });
  };

  return (
    <div className="login-container">
      <aside className="login-brand">
        <div className="login-brand-top">
          <span className="login-brand-mark" aria-hidden="true">
            ARJ
          </span>
          <div>
            <h1>Arjun Capital</h1>
            <p>Smart Engagement Engine</p>
          </div>
        </div>

        <div className="login-brand-body">
          <h2>Your data, your choice.</h2>
          <p className="login-brand-lead">
            Manage how your transaction data is used and discover offers made for you — securely, in one place.
          </p>
          <ul className="login-trust">
            <li>
              <span className="login-trust-icon"><FiShield aria-hidden="true" /></span>
              <div>
                <strong>DPDP Act compliant</strong>
                <span>Consent handled under the DPDP Act, 2023</span>
              </div>
            </li>
            <li>
              <span className="login-trust-icon"><FiSmartphone aria-hidden="true" /></span>
              <div>
                <strong>OTP-secured consent</strong>
                <span>Every consent is confirmed on your phone</span>
              </div>
            </li>
            <li>
              <span className="login-trust-icon"><FiUserCheck aria-hidden="true" /></span>
              <div>
                <strong>Opt out any time</strong>
                <span>Withdraw consent with a single click</span>
              </div>
            </li>
          </ul>
        </div>

        <p className="login-brand-foot">© {new Date().getFullYear()} Arjun Capital. All rights reserved.</p>
      </aside>

      <main className="login-panel">
        <div className="login-form">
          <div className="login-form-head">
            <h2>Sign in</h2>
            <p>Use your Arjun Capital credentials to continue.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="login-username">Username</label>
              <div className="input-wrap">
                <FiUser className="input-icon" aria-hidden="true" />
                <input
                  id="login-username"
                  type="text"
                  name="username"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                  autoComplete="username"
                  required
                  disabled={loading}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <div className="input-wrap">
                <FiLock className="input-icon" aria-hidden="true" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="input-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
                </button>
              </div>
            </div>
            {error && <p className="form-message error login-error" role="alert">{error}</p>}
            <button type="submit" className="login-btn" disabled={loading}>
              {loading && <span className="btn-spinner" aria-hidden="true" />}
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="login-secure-note">
            <FiLock aria-hidden="true" /> Secured connection
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;
