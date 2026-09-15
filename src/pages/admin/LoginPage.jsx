import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Printer,
  LogIn,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  HelpCircle,
  CheckCircle2,
  ArrowLeft,
  Mail,
  Eye,
  EyeOff,
  X,
  Lock,
} from 'lucide-react';
import Button from '../../components/common/Button';
import activityLogService from '../../services/activityLogService';
import './LoginPage.css';

export default function LoginPage() {
  const { login, sendPasswordReset, resetPasswordWithSecurityAnswer } = useAuth();
  const navigate = useNavigate();

  // Login form state
  const [email, setEmail] = useState('admin@thakre.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('admin@thakre.com');
  const [sonNameAnswer, setSonNameAnswer] = useState('');
  const [isAnswerVerified, setIsAnswerVerified] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  // Reset password fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      await activityLogService.logLogin(user.uid, user.email || user.displayName);
      navigate('/admin');
    } catch (err) {
      console.error('Login error:', err);
      if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-credential'
      ) {
        setError('Invalid email or password. If you forgot your password, click "Forgot Password?" below.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again in a few moments.');
      } else {
        setError(err.message || 'Login failed. Please verify your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForgotModal = () => {
    setForgotEmail(email || 'admin@thakre.com');
    setSonNameAnswer('');
    setIsAnswerVerified(false);
    setForgotError('');
    setForgotSuccess('');
    setNewPassword('');
    setConfirmPassword('');
    setResetDone(false);
    setShowForgotModal(true);
  };

  const handleVerifySecurityQuestion = (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    const normalized = (sonNameAnswer || '').trim().toLowerCase().replace(/\s+/g, ' ');
    if (!normalized) {
      setForgotError('Please enter your answer.');
      return;
    }

    if (normalized === 'ved thakre') {
      setIsAnswerVerified(true);
      setForgotSuccess('Identity verified! Security question answered correctly.');
    } else {
      setForgotError('Incorrect answer. Please enter the correct son name.');
    }
  };

  const handleQuickLoginWithDefault = async () => {
    setEmail(forgotEmail || 'admin@thakre.com');
    setPassword('Admin@7890');
    setShowForgotModal(false);
    setLoading(true);
    try {
      const user = await login(forgotEmail || 'admin@thakre.com', 'Admin@7890');
      await activityLogService.logLogin(user.uid, user.email || user.displayName);
      navigate('/admin');
    } catch (err) {
      console.error('Quick login error:', err);
      setError('Could not complete auto-login. Please sign in with password: Admin@7890');
    } finally {
      setLoading(false);
    }
  };

  const handleSetNewPassword = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (!newPassword || newPassword.length < 6) {
      setForgotError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setForgotError('Passwords do not match.');
      return;
    }

    setForgotLoading(true);
    try {
      await resetPasswordWithSecurityAnswer(forgotEmail, sonNameAnswer, newPassword);
      setResetDone(true);
      setForgotSuccess('Password updated successfully in Firebase! You can now log in.');
      setPassword(newPassword);
    } catch (err) {
      setForgotError(err.message || 'Failed to update password. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSendResetEmail = async () => {
    setForgotLoading(true);
    setForgotError('');
    try {
      await sendPasswordReset(forgotEmail);
      setForgotSuccess(`Firebase password reset link sent to ${forgotEmail}. Please check your inbox.`);
    } catch (err) {
      setForgotError(err.message || 'Failed to send password reset email.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-card animate-scale-in">
        <div className="login-brand">
          <div className="login-icon-badge">
            <Printer size={32} />
          </div>
          <h1>Thakre Printing Press</h1>
          <p>Admin Panel & Management Console</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="login-error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@thakre.com"
              autoComplete="email"
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <div className="form-label-row">
              <label className="form-label">Password</label>
              <button
                type="button"
                className="forgot-password-link"
                onClick={handleOpenForgotModal}
              >
                Forgot Password?
              </button>
            </div>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input password-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            icon={LogIn}
            loading={loading}
            fullWidth
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </Button>

          <div className="login-footer-hint">
            <ShieldCheck size={14} />
            <span>Secured by Firebase Authentication</span>
          </div>
        </form>
      </div>

      {/* Forgot Password Security Modal */}
      {showForgotModal && (
        <div className="modal-backdrop animate-fade-in" onClick={() => setShowForgotModal(false)}>
          <div
            className="forgot-modal animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-header-title">
                <KeyRound className="modal-title-icon" size={22} />
                <div>
                  <h3>Forgot Password Recovery</h3>
                  <p>Security question verification</p>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowForgotModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {forgotError && (
                <div className="forgot-alert forgot-alert-error">
                  <AlertCircle size={18} />
                  <span>{forgotError}</span>
                </div>
              )}

              {forgotSuccess && (
                <div className="forgot-alert forgot-alert-success">
                  <CheckCircle2 size={18} />
                  <span>{forgotSuccess}</span>
                </div>
              )}

              {!isAnswerVerified ? (
                /* Step 1: Security Question */
                <form onSubmit={handleVerifySecurityQuestion} className="forgot-step-form">
                  <div className="form-group">
                    <label className="form-label">Admin Email</label>
                    <input
                      type="email"
                      className="form-input"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="admin@thakre.com"
                      required
                    />
                  </div>

                  <div className="security-question-card">
                    <div className="security-question-label">
                      <HelpCircle size={18} className="question-icon" />
                      <span>Security Question</span>
                    </div>
                    <p className="security-question-text">Enter your son name</p>
                    <input
                      type="text"
                      className="form-input"
                      value={sonNameAnswer}
                      onChange={(e) => setSonNameAnswer(e.target.value)}
                      placeholder="Enter the name here..."
                      autoFocus
                      required
                    />
                  </div>

                  <div className="modal-actions">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowForgotModal(false)}
                      icon={ArrowLeft}
                    >
                      Back to Sign In
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      icon={ShieldCheck}
                    >
                      Verify Answer
                    </Button>
                  </div>
                </form>
              ) : (
                /* Step 2: Answer Verified */
                <div className="forgot-verified-flow">
                  <div className="verified-badge">
                    <ShieldCheck size={28} />
                    <div>
                      <h4>Answer Verified: "Ved Thakre"</h4>
                      <p>Identity confirmed for {forgotEmail}</p>
                    </div>
                  </div>

                  <div className="credentials-callout">
                    <div className="credentials-info">
                      <Lock size={18} />
                      <div>
                        <div className="cred-row">
                          <span className="cred-label">Login Email:</span>
                          <span className="cred-value">{forgotEmail}</span>
                        </div>
                        <div className="cred-row">
                          <span className="cred-label">Current Password:</span>
                          <span className="cred-code">Admin@7890</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="primary"
                      size="md"
                      onClick={handleQuickLoginWithDefault}
                      icon={LogIn}
                      fullWidth
                    >
                      Sign In with Admin@7890
                    </Button>
                  </div>

                  {!resetDone ? (
                    <form onSubmit={handleSetNewPassword} className="new-password-form">
                      <div className="divider-label">
                        <span>OR SET A NEW PASSWORD</span>
                      </div>

                      <div className="form-group">
                        <label className="form-label">New Password</label>
                        <div className="password-input-wrapper">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            className="form-input password-input"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="At least 6 characters"
                            required
                          />
                          <button
                            type="button"
                            className="password-toggle-btn"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            tabIndex="-1"
                          >
                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Confirm New Password</label>
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          className="form-input"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter new password"
                          required
                        />
                      </div>

                      <div className="new-password-actions">
                        <Button
                          type="submit"
                          variant="secondary"
                          icon={Lock}
                          loading={forgotLoading}
                          fullWidth
                        >
                          {forgotLoading ? 'Updating Password...' : 'Save New Password'}
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="reset-success-box">
                      <p>Your password was updated in Firebase Auth!</p>
                      <Button
                        type="button"
                        variant="primary"
                        onClick={() => {
                          setShowForgotModal(false);
                        }}
                        icon={LogIn}
                        fullWidth
                      >
                        Return to Sign In
                      </Button>
                    </div>
                  )}

                  <div className="email-reset-option">
                    <button
                      type="button"
                      className="email-reset-btn"
                      onClick={handleSendResetEmail}
                      disabled={forgotLoading}
                    >
                      <Mail size={16} />
                      <span>Send Firebase password reset email to {forgotEmail}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
