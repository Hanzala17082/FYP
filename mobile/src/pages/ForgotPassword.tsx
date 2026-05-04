import { useState } from 'react'
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
import { mail, checkmarkCircle } from 'ionicons/icons'
import './ForgotPassword.css'

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Email is required')
      return
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to send reset link')
      }

      setIsSubmitted(true)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send reset link. Please try again.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleClearError = () => {
    setError('')
  }

  const handleResend = () => {
    setIsSubmitted(false)
    setEmail('')
  }

  // Success State
  if (isSubmitted) {
    return (
      <IonPage>
        <IonHeader className="forgot-password-header">
          <IonToolbar>
            <IonTitle>Tripster</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen className="forgot-password-content">
          {/* Hero Section */}
          <div className="forgot-hero">
            <h1 className="forgot-hero-title">Check Your Email</h1>
          </div>

          {/* Success Container */}
          <div className="forgot-form-container">
            <div className="success-box">
              <div className="success-icon">
                <IonIcon icon={checkmarkCircle} />
              </div>

              <h2 className="success-title">Check Your Email</h2>
              <p className="success-text">
                We've sent a password reset link to <span className="email-highlight">{email}</span>. Please check
                your inbox and follow the instructions.
              </p>

              <div className="success-actions">
                <IonButton expand="block" className="forgot-submit-btn" onClick={handleResend}>
                  Resend Email
                </IonButton>
                <a href="/login" className="forgot-back-link">
                  <IonButton expand="block" fill="outline" className="forgot-outline-btn">
                    Back to Login
                  </IonButton>
                </a>
              </div>
            </div>
          </div>
        </IonContent>
      </IonPage>
    )
  }

  // Form State
  return (
    <IonPage>
      <IonHeader className="forgot-password-header">
        <IonToolbar>
          <IonTitle>Tripster</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="forgot-password-content">
        {/* Hero Section */}
        <div className="forgot-hero">
          <h1 className="forgot-hero-title">Forgot Password?</h1>
        </div>

        {/* Form Container */}
        <div className="forgot-form-container">
          <div className="forgot-form-header">
            <h2 className="forgot-form-title">Forgot Password?</h2>
            <p className="forgot-form-subtitle">
              No worries! Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          <form className="forgot-form" onSubmit={handleSubmit}>
            {/* Email Input */}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrapper">
                <IonIcon icon={mail} className="input-icon" />
                <IonInput
                  className="form-input"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onIonChange={(e) => {
                    setEmail(e.detail.value || '')
                    handleClearError()
                  }}
                  required
                />
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="error-box">
                <p className="error-text">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <IonButton expand="block" type="submit" disabled={loading} className="forgot-submit-btn">
              {loading ? (
                <div className="loading-state">
                  <IonSpinner name="circular" />
                  <span>Sending...</span>
                </div>
              ) : (
                'Send Reset Link'
              )}
            </IonButton>
          </form>

          {/* Back to Login */}
          <div className="forgot-footer">
            <p>
              Remember your password?{' '}
              <a href="/login" className="forgot-login-link">
                Log In
              </a>
            </p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  )
}

export default ForgotPassword
