import { useState } from 'react'
import { useHistory } from 'react-router-dom'
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonBadge,
} from '@ionic/react'
import {
  people,
  airplane,
  business,
  bookmark,
  checkmarkCircle,
  timeOutline,
  person,
  logOut,
  shield,
} from 'ionicons/icons'
import { useAuth } from '../contexts/AuthContext'
import './AdminDashboard.css'

type AdminTab = 'overview' | 'users' | 'trips' | 'agencies'

interface AdminStat {
  label: string
  value: number | string
  icon: string
  color: string
  trend?: string
}

interface UserItem {
  id: string
  name: string
  email: string
  role: string
  status: 'active' | 'inactive'
  joinedDate: string
}

interface TripItem {
  id: string
  title: string
  agency: string
  status: 'active' | 'pending' | 'completed'
  bookings: number
  price: string
}

interface AgencyItem {
  id: string
  name: string
  email: string
  verified: boolean
  trips: number
  rating: number
  status: 'verified' | 'basic' | 'pending'
}

const AdminDashboard: React.FC = () => {
  const history = useHistory()
  const { user, logout: authLogout } = useAuth()
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')

  // Check if user is admin
  if (user?.role !== 'Admin') {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Access Denied</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <div className="error-container">
            <IonIcon icon={shield} />
            <h2>Admin Access Required</h2>
            <p>You don't have permission to access this page.</p>
            <IonButton expand="block" onClick={() => history.push('/dashboard')}>
              Go to Dashboard
            </IonButton>
          </div>
        </IonContent>
      </IonPage>
    )
  }

  // Mock data
  const stats: AdminStat[] = [
    {
      label: 'Total Users',
      value: '2,453',
      icon: people,
      color: '#2563eb',
      trend: '+12%',
    },
    {
      label: 'Active Trips',
      value: '187',
      icon: airplane,
      color: '#10b981',
      trend: '+8%',
    },
    {
      label: 'Agencies',
      value: '45',
      icon: business,
      color: '#f59e0b',
      trend: '+3%',
    },
    {
      label: 'Total Bookings',
      value: '5.2k',
      icon: bookmark,
      color: '#8b5cf6',
      trend: '+24%',
    },
  ]

  const recentUsers: UserItem[] = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john@example.com',
      role: 'Traveler',
      status: 'active',
      joinedDate: '2 days ago',
    },
    {
      id: '2',
      name: 'Sarah Khan',
      email: 'sarah@example.com',
      role: 'Agency',
      status: 'active',
      joinedDate: '5 days ago',
    },
    {
      id: '3',
      name: 'Ahmed Hassan',
      email: 'ahmed@example.com',
      role: 'Traveler',
      status: 'inactive',
      joinedDate: '10 days ago',
    },
  ]

  const recentTrips: TripItem[] = [
    {
      id: '1',
      title: 'Hunza Valley Adventure',
      agency: 'Adventurous Tours',
      status: 'active',
      bookings: 12,
      price: '$1,200',
    },
    {
      id: '2',
      title: 'Naran Kaghan Tour',
      agency: 'Nature Explorers',
      status: 'pending',
      bookings: 5,
      price: '$850',
    },
    {
      id: '3',
      title: 'Northern Areas Trek',
      agency: 'Mountain Trails',
      status: 'completed',
      bookings: 18,
      price: '$1,500',
    },
  ]

  const agencies: AgencyItem[] = [
    {
      id: '1',
      name: 'Adventurous Tours',
      email: 'info@adventurous.com',
      verified: true,
      trips: 24,
      rating: 4.8,
      status: 'verified',
    },
    {
      id: '2',
      name: 'Nature Explorers',
      email: 'contact@nature.com',
      verified: true,
      trips: 18,
      rating: 4.6,
      status: 'verified',
    },
    {
      id: '3',
      name: 'New Adventures',
      email: 'hello@newadventures.com',
      verified: false,
      trips: 3,
      rating: 4.2,
      status: 'pending',
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'verified':
        return '#10b981'
      case 'pending':
        return '#f59e0b'
      case 'completed':
        return '#6b7280'
      case 'inactive':
        return '#ef4444'
      default:
        return '#6b7280'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'verified':
        return checkmarkCircle
      case 'pending':
        return timeOutline
      default:
        return timeOutline
    }
  }

  const renderOverview = () => (
    <div className="admin-overview">
      <div className="admin-welcome">
        <h2>Admin Panel</h2>
        <p>Manage platform, users, and content</p>
      </div>

      <div className="admin-stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="admin-stat-card">
            <IonIcon icon={stat.icon} style={{ color: stat.color }} />
            <p className="stat-label">{stat.label}</p>
            <p className="stat-value">{stat.value}</p>
            {stat.trend && <p className="stat-trend">{stat.trend}</p>}
          </div>
        ))}
      </div>

      <div className="quick-summary">
        <h3>Today's Summary</h3>
        <div className="summary-items">
          <div className="summary-item">
            <span className="summary-icon">👤</span>
            <div>
              <p className="summary-label">New Users</p>
              <p className="summary-value">23</p>
            </div>
          </div>
          <div className="summary-item">
            <span className="summary-icon">✈️</span>
            <div>
              <p className="summary-label">New Trips</p>
              <p className="summary-value">8</p>
            </div>
          </div>
          <div className="summary-item">
            <span className="summary-icon">📅</span>
            <div>
              <p className="summary-label">Bookings</p>
              <p className="summary-value">45</p>
            </div>
          </div>
          <div className="summary-item">
            <span className="summary-icon">💰</span>
            <div>
              <p className="summary-label">Revenue</p>
              <p className="summary-value">$12.4k</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderUsers = () => (
    <div className="admin-users">
      <h3>Recent Users</h3>
      <div className="user-list">
        {recentUsers.map((user) => (
          <div key={user.id} className="user-card">
            <div className="user-avatar">
              <IonIcon icon={person} />
            </div>
            <div className="user-info">
              <h4>{user.name}</h4>
              <p className="user-email">{user.email}</p>
              <p className="user-role">{user.role}</p>
            </div>
            <div className="user-status">
              <IonIcon icon={getStatusIcon(user.status)} style={{ color: getStatusColor(user.status) }} />
              <IonBadge color={user.status === 'active' ? 'success' : 'danger'}>{user.status}</IonBadge>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderTrips = () => (
    <div className="admin-trips">
      <h3>Recent Trips</h3>
      <div className="trip-list">
        {recentTrips.map((trip) => (
          <div key={trip.id} className="trip-card">
            <div className="trip-icon">
              <IonIcon icon={airplane} />
            </div>
            <div className="trip-info">
              <h4>{trip.title}</h4>
              <p className="trip-agency">{trip.agency}</p>
              <div className="trip-details">
                <span>{trip.bookings} bookings</span>
                <span>{trip.price}</span>
              </div>
            </div>
            <IonBadge
              color={
                trip.status === 'active' ? 'primary' : trip.status === 'pending' ? 'warning' : 'medium'
              }
            >
              {trip.status}
            </IonBadge>
          </div>
        ))}
      </div>
    </div>
  )

  const renderAgencies = () => (
    <div className="admin-agencies">
      <h3>Agencies</h3>
      <div className="agency-list">
        {agencies.map((agency) => (
          <div key={agency.id} className="agency-card">
            <div className="agency-header">
              <div>
                <h4>{agency.name}</h4>
                <p className="agency-email">{agency.email}</p>
              </div>
              {agency.verified && (
                <IonIcon icon={checkmarkCircle} style={{ color: '#10b981', fontSize: '24px' }} />
              )}
            </div>
            <div className="agency-stats">
              <div className="stat">
                <p className="label">Trips</p>
                <p className="value">{agency.trips}</p>
              </div>
              <div className="stat">
                <p className="label">Rating</p>
                <p className="value">{agency.rating}⭐</p>
              </div>
              <IonBadge
                color={
                  agency.status === 'verified' ? 'success' : agency.status === 'pending' ? 'warning' : 'medium'
                }
              >
                {agency.status}
              </IonBadge>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const handleLogout = async () => {
    try {
      authLogout()
      history.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <IonPage>
      <IonHeader className="admin-header">
        <IonToolbar>
          <IonTitle>Admin Panel</IonTitle>
          <IonButton slot="end" fill="clear" onClick={handleLogout}>
            <IonIcon icon={logOut} />
          </IonButton>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="admin-content">
        <div className="admin-container">
          <IonSegment
            value={activeTab}
            onIonChange={(e) => setActiveTab(e.detail.value as AdminTab)}
            className="admin-tabs"
          >
            <IonSegmentButton value="overview">
              <IonIcon icon={shield} />
              <IonLabel>Overview</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="users">
              <IonIcon icon={people} />
              <IonLabel>Users</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="trips">
              <IonIcon icon={airplane} />
              <IonLabel>Trips</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="agencies">
              <IonIcon icon={business} />
              <IonLabel>Agencies</IonLabel>
            </IonSegmentButton>
          </IonSegment>

          <div className="tab-content">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'trips' && renderTrips()}
            {activeTab === 'agencies' && renderAgencies()}
          </div>
        </div>
      </IonContent>
    </IonPage>
  )
}

export default AdminDashboard
