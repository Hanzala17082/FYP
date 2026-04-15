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
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
} from '@ionic/react'
import {
  addCircle,
  airplane,
  checkmarkCircle,
  timeOutline,
  closeCircle,
  person,
  compass,
  heart,
} from 'ionicons/icons'
import { useAuth } from '../contexts/AuthContext'
import './Dashboard.css'

type DashboardTab = 'overview' | 'activity' | 'analytics'

interface StatCard {
  label: string
  value: number | string
  icon: string
  color: string
}

interface ActivityItem {
  id: string
  title: string
  description: string
  date: string
  status: 'pending' | 'completed' | 'rejected'
  type: 'trip' | 'booking' | 'request'
}

const Dashboard: React.FC = () => {
  const history = useHistory()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview')

  // Mock data - replace with API calls
  const stats: StatCard[] =
    user?.role === 'Traveler'
      ? [
          { label: 'Trips Completed', value: 5, icon: checkmarkCircle, color: '#10b981' },
          { label: 'Pending Bookings', value: 2, icon: timeOutline, color: '#f59e0b' },
          { label: 'Wishlist Items', value: 8, icon: heart, color: '#ef4444' },
          { label: 'Total Spent', value: '$2,450', icon: compass, color: '#2563eb' },
        ]
      : [
          { label: 'Active Trips', value: 12, icon: airplane, color: '#2563eb' },
          { label: 'Pending Requests', value: 4, icon: timeOutline, color: '#f59e0b' },
          { label: 'Total Travelers', value: 89, icon: person, color: '#10b981' },
          { label: 'Revenue', value: '$5,230', icon: compass, color: '#8b5cf6' },
        ]

  const recentActivity: ActivityItem[] = [
    {
      id: '1',
      title: 'Trip Booking Request',
      description: 'New request from John for Naran trip',
      date: '2 hours ago',
      status: 'pending',
      type: 'request',
    },
    {
      id: '2',
      title: 'Trip Completed',
      description: 'Hunza Valley expedition finished successfully',
      date: '1 day ago',
      status: 'completed',
      type: 'trip',
    },
    {
      id: '3',
      title: 'Booking Rejected',
      description: 'Request from Sarah was rejected',
      date: '3 days ago',
      status: 'rejected',
      type: 'booking',
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#f59e0b'
      case 'completed':
        return '#10b981'
      case 'rejected':
        return '#ef4444'
      default:
        return '#6b7280'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return timeOutline
      case 'completed':
        return checkmarkCircle
      case 'rejected':
        return closeCircle
      default:
        return timeOutline
    }
  }

  const renderOverview = () => (
    <div className="dashboard-overview">
      <div className="welcome-card">
        <h2 className="welcome-title">Welcome back, {user?.fullName}!</h2>
        <p className="welcome-subtitle">
          {user?.role === 'Traveler' ? 'Explore amazing trips' : 'Manage your trips'}
        </p>
      </div>

      <div className="stats-container">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-card-icon" style={{ color: stat.color }}>
              <IonIcon icon={stat.icon} />
            </div>
            <p className="stat-card-label">{stat.label}</p>
            <p className="stat-card-value">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="quick-actions">
        <h3 className="actions-title">Quick Actions</h3>
        {user?.role === 'Traveler' ? (
          <>
            <IonButton
              expand="block"
              className="action-button browse-btn"
              onClick={() => history.push('/trips')}
            >
              <IonIcon slot="start" icon={compass} />
              Browse Trips
            </IonButton>
            <IonButton
              expand="block"
              className="action-button wishlist-btn"
              onClick={() => history.push('/profile')}
            >
              <IonIcon slot="start" icon={heart} />
              View Wishlist
            </IonButton>
          </>
        ) : (
          <>
            <IonButton
              expand="block"
              className="action-button add-btn"
              onClick={() => history.push('/trips')}
            >
              <IonIcon slot="start" icon={addCircle} />
              Create New Trip
            </IonButton>
            <IonButton
              expand="block"
              className="action-button manage-btn"
              onClick={() => history.push('/trips')}
            >
              <IonIcon slot="start" icon={airplane} />
              Manage Trips
            </IonButton>
          </>
        )}
      </div>
    </div>
  )

  const renderActivity = () => (
    <div className="dashboard-activity">
      <div className="activity-list">
        {recentActivity.length > 0 ? (
          recentActivity.map((item) => (
            <div key={item.id} className="activity-item">
              <div className="activity-icon" style={{ color: getStatusColor(item.status) }}>
                <IonIcon icon={getStatusIcon(item.status)} />
              </div>
              <div className="activity-content">
                <h4 className="activity-title">{item.title}</h4>
                <p className="activity-description">{item.description}</p>
                <p className="activity-date">{item.date}</p>
              </div>
              <div className="activity-status" style={{ color: getStatusColor(item.status) }}>
                {item.status}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <IonIcon icon={airplane} />
            <p>No recent activity</p>
          </div>
        )}
      </div>
    </div>
  )

  const renderAnalytics = () => (
    <div className="dashboard-analytics">
      <IonCard className="analytics-card">
        <IonCardHeader>
          <IonCardTitle>Performance Metrics</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <div className="metric-item">
            <span className="metric-label">Success Rate</span>
            <span className="metric-value">95%</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Average Rating</span>
            <span className="metric-value">4.8/5</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Response Time</span>
            <span className="metric-value">2.5 hrs</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Member Since</span>
            <span className="metric-value">{new Date(user?.createdAt || '').toLocaleDateString()}</span>
          </div>
        </IonCardContent>
      </IonCard>

      <IonCard className="analytics-card">
        <IonCardHeader>
          <IonCardTitle>This Month</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <div className="metric-item">
            <span className="metric-label">Total Trips</span>
            <span className="metric-value">8</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Total Travelers</span>
            <span className="metric-value">24</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Completed</span>
            <span className="metric-value">7</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Pending</span>
            <span className="metric-value">1</span>
          </div>
        </IonCardContent>
      </IonCard>
    </div>
  )

  return (
    <IonPage>
      <IonHeader className="dashboard-header">
        <IonToolbar>
          <IonTitle>Dashboard</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="dashboard-content">
        <div className="dashboard-container">
          <IonSegment
            value={activeTab}
            onIonChange={(e) => setActiveTab(e.detail.value as DashboardTab)}
            className="dashboard-tabs"
          >
            <IonSegmentButton value="overview">
              <IonLabel>Overview</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="activity">
              <IonLabel>Activity</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="analytics">
              <IonLabel>Analytics</IonLabel>
            </IonSegmentButton>
          </IonSegment>

          <div className="tab-content">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'activity' && renderActivity()}
            {activeTab === 'analytics' && renderAnalytics()}
          </div>
        </div>
      </IonContent>
    </IonPage>
  )
}

export default Dashboard
