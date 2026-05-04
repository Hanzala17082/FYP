import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonInput,
  IonButton,
  IonSpinner,
  IonText,
  IonIcon,
} from '@ionic/react';
import { eye, eyeOff, mail, lockClosed } from 'ionicons/icons';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const Login: React.FC = () => {
  const history = useHistory();
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'Traveler' | 'Agency'>('Traveler');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Only check auth status when NOT currently logging in
  useEffect(() => {
    if (!loading && isAuthenticated && !authLoading) {
      console.log('User authenticated, redirecting to trips');
      history.replace('/trips');
    }
  }, [isAuthenticated, authLoading, loading, history]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      console.log('Submit login form:', { email, role });
      await login(email, password, role);
      console.log('Login completed, state will update');
    } catch (err) {
      console.error('Login error:', err);
      const errorMsg = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(errorMsg);
      setLoading(false);
    }
  };

  const handleClearError = () => {
    setError('');
  };

  return (
    <IonPage className="login-page">
      <IonHeader className="login-header" collapse="condense">
        <IonToolbar className="login-toolbar">
          <IonTitle size="large" className="login-title">Tripster</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="login-content">
        {/* Background Image Section */}
        <div className="login-hero">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDh0bSL1iVgeARM6qePfOIh0hNQRBjVRhIPpevXbbzfQkiYtHKFnvj4bqYBhCjqC4YPjQF1OOQLd8Zwgp8S0Ml7e9L2livihz4sljgWGac1i7jUwyDxgzQtoupGgBeXaKpIE6qdEwCLnknvm5q9z-LKbKbi54elDt61QZPnA8FNgwDJKmcYrvJRmd0xBbkklBXRu5K1r0C08fk3Om9Mwe6bzDmz46BTInucSc-JeS1I6h4iFiSYKfizSZvRKw9w-8T9L09x0zAVC5o"
            alt="Travel Background"
            className="login-hero-image"
          />
          <div className="login-hero-overlay"></div>
          <div className="login-hero-content">
            <h2 className="login-hero-title">Welcome Back</h2>
          </div>
        </div>

        {/* Form Container */}
        <div className="login-form-container">
          <div className="login-form-header">
            <h1 className="login-form-title">Sign In</h1>
            <p className="login-form-subtitle">Please enter your details to sign in</p>
          </div>

          {/* Role Selector */}
          <div className="login-role-selector">
            <button
              type="button"
              className={`role-button ${role === 'Traveler' ? 'active' : ''}`}
              onClick={() => setRole('Traveler')}
            >
              Traveler
            </button>
            <button
              type="button"
              className={`role-button ${role === 'Agency' ? 'active' : ''}`}
              onClick={() => setRole('Agency')}
            >
              Agency
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {/* Email Input */}
            <div className="login-input-group">
              <label className="login-input-label">Email Address</label>
              <div className="login-input-wrapper">
                <IonIcon icon={mail} className="login-input-icon" />
                <IonInput
                  className="login-input"
                  type="email"
                  value={email}
                  onIonInput={(e) => {
                    setEmail(e.detail.value || '');
                    handleClearError();
                  }}
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="login-input-group">
              <div className="login-password-header">
                <label className="login-input-label">Password</label>
                <IonButton
                  fill="clear"
                  size="small"
                  className="login-forgot-btn"
                  routerLink="/forgot-password"
                >
                  Forgot?
                </IonButton>
              </div>
              <div className="login-input-wrapper">
                <IonIcon icon={lockClosed} className="login-input-icon" />
                <IonInput
                  className="login-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onIonInput={(e) => {
                    setPassword(e.detail.value || '');
                    handleClearError();
                  }}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <IonIcon icon={showPassword ? eyeOff : eye} />
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="login-error-box">
                <IonText color="danger">
                  <p>{error}</p>
                </IonText>
              </div>
            )}

            {/* Submit Button */}
            <IonButton
              type="submit"
              expand="block"
              disabled={loading}
              className="login-submit-btn ion-margin-top"
            >
              {loading ? (
                <div className="login-loading">
                  <IonSpinner name="crescent" />
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </IonButton>
          </form>

          {/* Divider */}
          <div className="login-divider">
            <span>Or continue with</span>
          </div>

          {/* Social Login Buttons */}
          <div className="login-social-buttons">
            <button className="login-social-btn">
              <svg className="social-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M23.7663 12.2764C23.7663 11.4607 23.6999 10.6406 23.5588 9.83807H12.2402V14.4591H18.722C18.4528 15.9494 17.5887 17.2678 16.3233 18.1056V21.1039H20.1903C22.4611 19.0139 23.7663 15.9274 23.7663 12.2764Z"
                  fill="#4285F4"
                ></path>
                <path
                  d="M12.2401 24.0008C15.4765 24.0008 18.2059 22.9382 20.1945 21.1039L16.3275 18.1055C15.2517 18.8375 13.8627 19.252 12.2445 19.252C9.11391 19.252 6.45949 17.1399 5.50708 14.3003H1.5166V17.3912C3.55374 21.4434 7.70293 24.0008 12.2401 24.0008Z"
                  fill="#34A853"
                ></path>
                <path
                  d="M5.50277 14.3003C4.99952 12.8099 4.99952 11.1961 5.50277 9.70575V6.61481H1.51674C-0.185512 10.0056 -0.185512 14.0004 1.51674 17.3912L5.50277 14.3003Z"
                  fill="#FBBC05"
                ></path>
                <path
                  d="M12.2401 4.74966C13.9509 4.7232 15.6044 5.36697 16.8434 6.54867L20.2695 3.12262C18.1001 1.0855 15.2208 -0.0344664 12.2401 0.000808666C7.70293 0.000808666 3.55374 2.55822 1.5166 6.61481L5.50264 9.70575C6.45064 6.86173 9.10947 4.74966 12.2401 4.74966Z"
                  fill="#EA4335"
                ></path>
              </svg>
              <span>Google</span>
            </button>
            <button className="login-social-btn">
              <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-.68-.32-1.39-.32-2.08 0-1.03.48-2.1.55-3.07-.4-4.15-4.08-3.5-11.2 1.48-11.45 1.25-.06 2.14.65 2.82.63.78-.02 2.14-.89 3.6-.65 1.53.25 2.68 1.01 3.42 2.12-2.95 1.83-2.45 6.09.52 7.37-.66 1.34-1.54 2.66-2.61 3.73v.25ZM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.17 2.37-1.92 4.22-3.74 4.25Z"></path>
              </svg>
              <span>Apple</span>
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="login-signup-link">
            <p>
              Don't have an account?{' '}
              <IonButton fill="clear" size="small" routerLink="/register" className="signup-btn">
                Sign Up
              </IonButton>
            </p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
