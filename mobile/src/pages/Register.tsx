'use client'

import { useState } from 'react'
import { useHistory } from 'react-router-dom'
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonInput,
  IonSpinner,
  IonIcon,
} from '@ionic/react'
import { mail, lockClosed, person, location, eye, eyeOff } from 'ionicons/icons'
import { useAuth } from '../contexts/AuthContext'
import './Register.css'

const Register: React.FC = () => {
  const history = useHistory()
  const authContext = useAuth()
  const [role, setRole] = useState<'Traveler' | 'Agency'>('Traveler')
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    city: '',
    cnic: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!formData.fullName.trim()) {
      setError('Full name is required')
      return
    }
    if (!formData.email.trim()) {
      setError('Email is required')
      return
    }
    if (!formData.city.trim()) {
      setError('City is required')
      return
    }
    if (!formData.cnic.trim()) {
      setError('CNIC is required')
      return
    }
    if (!formData.password) {
      setError('Password is required')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (!formData.agreeToTerms) {
      setError('You must agree to the Terms & Conditions')
      return
    }

    setLoading(true)
    try {
      // Call register endpoint
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          city: formData.city,
          cnic: formData.cnic,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          role,
          agreeToTerms: formData.agreeToTerms,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Registration failed')
      }

      // Login the user with the response
      await authContext.login(formData.email, formData.password, role)
      history.push('/trips')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed. Please try again.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleClearError = () => {
    setError('')
  }

  return (
    <IonPage>
      <IonHeader className="register-header">
        <IonToolbar>
          <IonTitle>Tripster</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="register-content">
        {/* Hero Section */}
        <div className="register-hero">
          <h1 className="register-hero-title">Create Account</h1>
        </div>

        {/* Form Container */}
        <div className="register-form-container">
          <div className="register-form-header">
            <h2 className="register-form-title">Create Account</h2>
            <p className="register-form-subtitle">Sign up as a traveler to discover and book trips.</p>
          </div>

          {/* Role Selector */}
          <div className="register-role-selector">
            <button
              className={`role-pill ${role === 'Traveler' ? 'active' : ''}`}
              onClick={() => setRole('Traveler')}
            >
              Traveler
            </button>
            <button
              className={`role-pill ${role === 'Agency' ? 'active' : ''}`}
              onClick={() => setRole('Agency')}
            >
              Agency
            </button>
          </div>

          <form className="register-form" onSubmit={handleSubmit}>
            {/* Full Name Input */}
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-wrapper">
                <IonIcon icon={person} className="input-icon" />
                <IonInput
                  className="form-input"
                  type="text"
                  placeholder="e.g. John Doe"
                  value={formData.fullName}
                  onIonChange={(e) => {
                    setFormData({ ...formData, fullName: e.detail.value || '' })
                    handleClearError()
                  }}
                  required
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrapper">
                <IonIcon icon={mail} className="input-icon" />
                <IonInput
                  className="form-input"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onIonChange={(e) => {
                    setFormData({ ...formData, email: e.detail.value || '' })
                    handleClearError()
                  }}
                  required
                />
              </div>
            </div>

            {/* City and CNIC Row */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">City</label>
                <div className="input-wrapper">
                  <IonIcon icon={location} className="input-icon" />
                  <IonInput
                    className="form-input"
                    type="text"
                    placeholder="Your City"
                    value={formData.city}
                    onIonChange={(e) => {
                      setFormData({ ...formData, city: e.detail.value || '' })
                      handleClearError()
                    }}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">CNIC</label>
                <div className="input-wrapper">
                  <IonIcon icon={person} className="input-icon" />
                  <IonInput
                    className="form-input"
                    type="text"
                    placeholder="xxxxx-xxxxxxx-x"
                    value={formData.cnic}
                    onIonChange={(e) => {
                      setFormData({ ...formData, cnic: e.detail.value || '' })
                      handleClearError()
                    }}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Password Input */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper password-wrapper">
                <IonIcon icon={lockClosed} className="input-icon" />
                <IonInput
                  className="form-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={formData.password}
                  onIonChange={(e) => {
                    setFormData({ ...formData, password: e.detail.value || '' })
                    handleClearError()
                  }}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <IonIcon icon={showPassword ? eyeOff : eye} />
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="input-wrapper password-wrapper">
                <IonIcon icon={lockClosed} className="input-icon" />
                <IonInput
                  className="form-input"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onIonChange={(e) => {
                    setFormData({ ...formData, confirmPassword: e.detail.value || '' })
                    handleClearError()
                  }}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <IonIcon icon={showConfirmPassword ? eyeOff : eye} />
                </button>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="form-checkbox-group">
              <input
                type="checkbox"
                id="terms"
                checked={formData.agreeToTerms}
                onChange={(e) => {
                  setFormData({ ...formData, agreeToTerms: e.target.checked })
                  handleClearError()
                }}
                required
              />
              <label htmlFor="terms" className="checkbox-label">
                I agree to the{' '}
                <a href="#" className="terms-link">
                  Terms & Conditions
                </a>
              </label>
            </div>

            {/* Error Display */}
            {error && (
              <div className="error-box">
                <p className="error-text">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <IonButton
              expand="block"
              type="submit"
              disabled={loading}
              className="register-submit-btn"
            >
              {loading ? (
                <div className="loading-state">
                  <IonSpinner name="circular" />
                  <span>Creating account...</span>
                </div>
              ) : (
                'Create Account'
              )}
            </IonButton>
          </form>

          {/* Divider */}
          <div className="divider">
            <span>Or sign up with</span>
          </div>

          {/* Social Buttons */}
          <div className="social-buttons">
            <button className="social-btn google-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="1" />
                <circle cx="19" cy="12" r="1" />
                <circle cx="5" cy="12" r="1" />
              </svg>
              Google
            </button>
            <button className="social-btn apple-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 13.5c-.91 0-1.82-.33-2.5-.92.9-.55 1.92-.88 3.12-.88 3.54 0 6.55 2.94 6.55 6.54 0 .5-.06 1-.17 1.47C23.9 18.5 24 17.26 24 16c0-3.86-3.59-7-8.95-7z" />
              </svg>
              Apple
            </button>
          </div>

          {/* Sign In Link */}
          <div className="signup-footer">
            <p>
              Already have an account?{' '}
              <a href="/login" className="login-link">
                Sign In
              </a>
            </p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  )
}

export default Register
