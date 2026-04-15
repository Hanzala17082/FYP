import { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonInput,
  IonSpinner,
} from '@ionic/react'
import {
  logOut,
  personCircle,
  settings,
  heart,
  airplane,
  checkmarkCircle,
} from 'ionicons/icons'
import { useAuth } from '../contexts/AuthContext'
import './Profile.css'

type ProfileTab = 'overview' | 'personal' | 'trips' | 'wishlist' | 'settings'

const Profile: React.FC = () => {
  const history = useHistory()
  const { user, logout: authLogout } = useAuth()
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [fullName, setFullName] = useState(user?.fullName || '')
  const [city, setCity] = useState(user?.city || '')
  const [showSavedBanner, setShowSavedBanner] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      history.push('/login')
    }
  }, [user, history])

  if (!user) {
    return null
  }

  const handleSaveProfile = async () => {
    setIsLoading(true)
    try {
      // API call to update profile
      setShowSavedBanner(true)
      setTimeout(() => setShowSavedBanner(false), 3000)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to save profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      authLogout()
      history.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const getRoleLabel = () => {
    if (user.role === 'Traveler') return 'Traveler'
    if (user.role === 'Agency') return 'Agency'
    return 'User'
  }

  const renderOverview = () => (
    <div className="profile-overview">
      <div className="profile-card">
        <div className="profile-avatar">
          {user.avatar ? (
            <img src={user.avatar} alt={user.fullName} />
          ) : (
            <div className="avatar-placeholder">
              <IonIcon icon={personCircle} />
            </div>
          )}
        </div>
        <h2 className="profile-name">{user.fullName}</h2>
        <p className="profile-email">{user.email}</p>
        <p className="profile-role">{getRoleLabel()}</p>
        {user.city && <p className="profile-city">{user.city}</p>}
      </div>

      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-icon">
            <IonIcon icon={airplane} />
          </div>
          <p className="stat-label">Account Type</p>
          <p className="stat-value">{getRoleLabel()}</p>
        </div>

        <div className="stat-item">
          <div className="stat-icon">
            <IonIcon icon={personCircle} />
          </div>
          <p className="stat-label">Member Since</p>
          <p className="stat-value">{new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="overview-actions">
        <IonButton expand="block" className="action-btn edit-btn" onClick={() => setActiveTab('personal')}>
          <IonIcon slot="start" icon={personCircle} />
          Edit Profile
        </IonButton>
        <IonButton expand="block" className="action-btn settings-btn" onClick={() => setActiveTab('settings')}>
          <IonIcon slot="start" icon={settings} />
          Settings
        </IonButton>
      </div>
    </div>
  )

  const renderPersonal = () => (
    <div className="profile-personal">
      {showSavedBanner && (
        <div className="saved-banner">
          <IonIcon icon={checkmarkCircle} />
          <span>Profile saved successfully</span>
        </div>
      )}

      <div className="personal-section">
        <h3 className="section-title">Personal Information</h3>

        {!isEditing ? (
          <div className="info-display">
            <div className="info-item">
              <label className="info-label">Full Name</label>
              <p className="info-value">{user.fullName}</p>
            </div>
            <div className="info-item">
              <label className="info-label">Email Address</label>
              <p className="info-value">{user.email}</p>
            </div>
            {user.city && (
              <div className="info-item">
                <label className="info-label">City</label>
                <p className="info-value">{user.city}</p>
              </div>
            )}

            <IonButton expand="block" className="edit-btn-primary" onClick={() => setIsEditing(true)}>
              Edit Information
            </IonButton>
          </div>
        ) : (
          <div className="info-edit">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <IonInput
                className="form-input"
                type="text"
                placeholder="Full Name"
                value={fullName}
                onIonChange={(e) => setFullName(e.detail.value || '')}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <IonInput className="form-input" type="email" value={user.email} disabled />
            </div>

            <div className="form-group">
              <label className="form-label">City</label>
              <IonInput
                className="form-input"
                type="text"
                placeholder="Your City"
                value={city}
                onIonChange={(e) => setCity(e.detail.value || '')}
              />
            </div>

            <div className="edit-actions">
              <IonButton
                expand="block"
                fill="outline"
                className="cancel-btn"
                onClick={() => {
                  setIsEditing(false)
                  setFullName(user.fullName)
                  setCity(user.city || '')
                }}
              >
                Cancel
              </IonButton>
              <IonButton
                expand="block"
                className="save-btn"
                onClick={handleSaveProfile}
                disabled={isLoading}
              >
                {isLoading ? <IonSpinner name="circular" /> : 'Save Changes'}
              </IonButton>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const renderTrips = () => (
    <div className="profile-trips">
      <h3 className="section-title">My Trips</h3>

      {user.role === 'Traveler' ? (
        <div className="trips-empty">
          <IonIcon icon={airplane} />
          <p className="empty-title">No trips yet</p>
          <p className="empty-desc">Browse and request trips to get started</p>
          <IonButton expand="block" className="browse-btn" onClick={() => history.push('/trips')}>
            Browse Trips
          </IonButton>
        </div>
      ) : (
        <div className="trips-empty">
          <IonIcon icon={airplane} />
          <p className="empty-title">Manage Your Trips</p>
          <p className="empty-desc">Add and manage trips from the dashboard</p>
          <IonButton expand="block" className="browse-btn" onClick={() => history.push('/dashboard')}>
            Go to Dashboard
          </IonButton>
        </div>
      )}
    </div>
  )

  const renderWishlist = () => (
    <div className="profile-wishlist">
      <h3 className="section-title">Wishlist</h3>

      <div className="wishlist-empty">
        <IonIcon icon={heart} />
        <p className="empty-title">Your wishlist is empty</p>
        <p className="empty-desc">Save trips to view them here later</p>
        <IonButton expand="block" className="browse-btn" onClick={() => history.push('/trips')}>
          Explore Trips
        </IonButton>
      </div>
    </div>
  )

  const renderSettings = () => (
    <div className="profile-settings">
      <h3 className="section-title">Settings & Security</h3>

      <div className="settings-section">
        <div className="settings-item">
          <div className="settings-info">
            <p className="settings-title">Account Type</p>
            <p className="settings-desc">{getRoleLabel()}</p>
          </div>
        </div>

        <div className="settings-item">
          <div className="settings-info">
            <p className="settings-title">Email Notifications</p>
            <p className="settings-desc">Get updates about trips and requests</p>
          </div>
          <input type="checkbox" className="toggle-switch" defaultChecked />
        </div>

        <div className="settings-item">
          <div className="settings-info">
            <p className="settings-title">Dark Mode</p>
            <p className="settings-desc">Prefer dark theme on this device</p>
          </div>
          <input type="checkbox" className="toggle-switch" />
        </div>
      </div>

      <div className="danger-zone">
        <h4 className="danger-title">Danger Zone</h4>

        <IonButton expand="block" fill="outline" className="logout-btn" onClick={handleLogout}>
          <IonIcon slot="start" icon={logOut} />
          Log Out
        </IonButton>
      </div>
    </div>
  )

  return (
    <IonPage>
      <IonHeader className="profile-header">
        <IonToolbar>
          <IonTitle>My Profile</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="profile-content">
        <div className="profile-container">
          <div className="tab-navigation">
            <button
              className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <IonIcon icon={personCircle} />
              <span className="tab-label">Overview</span>
            </button>
            <button
              className={`tab-button ${activeTab === 'personal' ? 'active' : ''}`}
              onClick={() => setActiveTab('personal')}
            >
              <IonIcon icon={personCircle} />
              <span className="tab-label">Personal</span>
            </button>
            <button
              className={`tab-button ${activeTab === 'trips' ? 'active' : ''}`}
              onClick={() => setActiveTab('trips')}
            >
              <IonIcon icon={airplane} />
              <span className="tab-label">Trips</span>
            </button>
            <button
              className={`tab-button ${activeTab === 'wishlist' ? 'active' : ''}`}
              onClick={() => setActiveTab('wishlist')}
            >
              <IonIcon icon={heart} />
              <span className="tab-label">Wishlist</span>
            </button>
            <button
              className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <IonIcon icon={settings} />
              <span className="tab-label">Settings</span>
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'personal' && renderPersonal()}
            {activeTab === 'trips' && renderTrips()}
            {activeTab === 'wishlist' && renderWishlist()}
            {activeTab === 'settings' && renderSettings()}
          </div>
        </div>
      </IonContent>
    </IonPage>
  )
}

export default Profile
