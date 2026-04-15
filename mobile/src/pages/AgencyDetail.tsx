import { useState, useEffect } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonSkeletonText,
  IonBackButton,
} from '@ionic/react'
import {
  star,
  location,
  checkmarkCircle,
  arrowBack,
  airplane,
  chatbubble,
} from 'ionicons/icons'
import './AgencyDetail.css'

interface AgencyDetailType {
  id: string
  name: string
  location: string
  verified: boolean
  rating: number
  reviewCount: number
  description: string
  trips: Trip[]
}

interface Trip {
  id: string
  title: string
  duration: string
  price: string
  startDate: string
  endDate: string
  status: 'active' | 'pending' | 'completed'
  image?: string
}

const AgencyDetail: React.FC = () => {
  const history = useHistory()
  const { id } = useParams<{ id: string }>()
  const [agency, setAgency] = useState<AgencyDetailType | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockAgencies: Record<string, AgencyDetailType> = {
        '1': {
          id: '1',
          name: 'Adventurous Tours',
          location: 'Islamabad, Pakistan',
          verified: true,
          rating: 4.8,
          reviewCount: 234,
          description:
            'Specialized in mountain trekking and adventure tours across the northern areas of Pakistan. We offer carefully curated experiences for adventure seekers with professional guides and safety equipment.',
          trips: [
            {
              id: 't1',
              title: 'Hunza Valley Adventure',
              duration: '5 days',
              price: '$1,200',
              startDate: '2026-05-15',
              endDate: '2026-05-20',
              status: 'active',
            },
            {
              id: 't2',
              title: 'K2 Base Camp Trek',
              duration: '8 days',
              price: '$1,800',
              startDate: '2026-06-01',
              endDate: '2026-06-09',
              status: 'pending',
            },
            {
              id: 't3',
              title: 'Northern Areas Explorer',
              duration: '7 days',
              price: '$1,500',
              startDate: '2026-06-15',
              endDate: '2026-06-22',
              status: 'active',
            },
          ],
        },
        '2': {
          id: '2',
          name: 'Nature Explorers',
          location: 'Lahore, Pakistan',
          verified: true,
          rating: 4.6,
          reviewCount: 189,
          description:
            'Eco-friendly tourism focused on nature conservation and wildlife observation. Join us for sustainable travel experiences that benefit local communities.',
          trips: [
            {
              id: 't4',
              title: 'Wildlife Safari',
              duration: '3 days',
              price: '$800',
              startDate: '2026-05-20',
              endDate: '2026-05-23',
              status: 'active',
            },
            {
              id: 't5',
              title: 'Forest Retreat',
              duration: '4 days',
              price: '$950',
              startDate: '2026-06-10',
              endDate: '2026-06-14',
              status: 'active',
            },
          ],
        },
        '3': {
          id: '3',
          name: 'Luxury Getaways',
          location: 'Karachi, Pakistan',
          verified: true,
          rating: 4.9,
          reviewCount: 156,
          description:
            'Premium luxury travel experiences with 5-star accommodations and personalized service. We cater to travelers seeking comfort and elegance.',
          trips: [
            {
              id: 't6',
              title: 'Beach Paradise Package',
              duration: '5 days',
              price: '$2,500',
              startDate: '2026-05-25',
              endDate: '2026-05-30',
              status: 'active',
            },
          ],
        },
      }

      const foundAgency = mockAgencies[id]
      if (foundAgency) {
        setAgency(foundAgency)
      } else {
        setNotFound(true)
      }
      setLoading(false)
    }, 600)
  }, [id])

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <IonIcon
        key={i}
        icon={star}
        className={i < Math.floor(rating) ? 'star-filled' : 'star-empty'}
      />
    ))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#10b981'
      case 'pending':
        return '#f59e0b'
      case 'completed':
        return '#6b7280'
      default:
        return '#6b7280'
    }
  }

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar className="agency-detail-header">
            <IonBackButton defaultHref="/agencies" />
            <IonTitle>Agency Details</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen className="agency-detail-content">
          <div className="agency-detail-container">
            <IonCard>
              <IonCardContent>
                <IonSkeletonText animated style={{ width: '80%', marginBottom: '12px' }} />
                <IonSkeletonText animated style={{ width: '60%', marginBottom: '24px' }} />
                <IonSkeletonText animated style={{ width: '100%', height: '80px' }} />
              </IonCardContent>
            </IonCard>
          </div>
        </IonContent>
      </IonPage>
    )
  }

  if (notFound || !agency) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar className="agency-detail-header">
            <IonBackButton defaultHref="/agencies" />
            <IonTitle>Agency Not Found</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen className="agency-detail-content">
          <div className="agency-detail-container">
            <div className="error-state">
              <h2>Agency Not Found</h2>
              <p>The agency you're looking for doesn't exist.</p>
              <IonButton onClick={() => history.push('/agencies')}>
                Back to Agencies
              </IonButton>
            </div>
          </div>
        </IonContent>
      </IonPage>
    )
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="agency-detail-header">
          <IonBackButton defaultHref="/agencies" />
          <IonTitle>Agency Details</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="agency-detail-content">
        <div className="agency-detail-container">
          {/* Agency Header Card */}
          <IonCard className="agency-header-card">
            <IonCardContent>
              <div className="agency-avatar-large">
                <div className="avatar-initials-large">
                  {agency.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase()}
                </div>
              </div>

              <div className="agency-title-section">
                <div className="agency-title-header">
                  <h1 className="agency-title">{agency.name}</h1>
                  {agency.verified && (
                    <IonIcon icon={checkmarkCircle} className="verified-badge" />
                  )}
                </div>

                <div className="agency-location-detail">
                  <IonIcon icon={location} />
                  <span>{agency.location}</span>
                </div>

                <div className="agency-rating-detail">
                  <div className="stars-large">{renderStars(agency.rating)}</div>
                  <span className="rating-text-detail">
                    {agency.rating.toFixed(1)} ({agency.reviewCount} reviews)
                  </span>
                </div>
              </div>
            </IonCardContent>
          </IonCard>

          {/* Description Card */}
          <IonCard className="description-card">
            <IonCardContent>
              <h3 className="section-title">About</h3>
              <p className="description-text">{agency.description}</p>
            </IonCardContent>
          </IonCard>

          {/* Contact Section */}
          <IonCard className="contact-card">
            <IonCardContent>
              <h3 className="section-title">Contact & Communication</h3>
              <p className="contact-text">
                Direct contact details are not shown publicly. Conversations and trip updates will happen inside the dedicated group for each trip.
              </p>
              <div className="contact-points">
                <div className="contact-point">
                  <IonIcon icon={chatbubble} />
                  <span>After booking, you'll be added to the trip group chat.</span>
                </div>
                <div className="contact-point">
                  <IonIcon icon={airplane} />
                  <span>All questions and coordination happen there.</span>
                </div>
              </div>
            </IonCardContent>
          </IonCard>

          {/* Trips Section */}
          {agency.trips.length > 0 && (
            <div className="trips-section">
              <h3 className="section-title-standalone">
                Trips Offered ({agency.trips.length})
              </h3>
              <div className="trips-list">
                {agency.trips.map((trip) => (
                  <IonCard key={trip.id} className="trip-card">
                    <IonCardContent>
                      <div className="trip-header">
                        <h4 className="trip-title">{trip.title}</h4>
                        <span className="trip-status" style={{ borderColor: getStatusColor(trip.status) }}>
                          {trip.status}
                        </span>
                      </div>

                      <div className="trip-info">
                        <div className="trip-info-item">
                          <span className="label">Duration</span>
                          <span className="value">{trip.duration}</span>
                        </div>
                        <div className="trip-info-item">
                          <span className="label">Price</span>
                          <span className="value price">{trip.price}</span>
                        </div>
                      </div>

                      <div className="trip-dates">
                        <div className="date-item">
                          <span className="date-label">Start</span>
                          <span className="date-value">{trip.startDate}</span>
                        </div>
                        <div className="date-item">
                          <span className="date-label">End</span>
                          <span className="date-value">{trip.endDate}</span>
                        </div>
                      </div>

                      <IonButton expand="block" className="view-trip-btn">
                        View Trip Details
                      </IonButton>
                    </IonCardContent>
                  </IonCard>
                ))}
              </div>
            </div>
          )}

          {/* Call to Action */}
          <div className="cta-section">
            <IonButton expand="block" color="primary" size="large">
              <IonIcon icon={chatbubble} slot="start" />
              Contact Agency
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  )
}

export default AgencyDetail
