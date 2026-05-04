import { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonSearchbar,
  IonSkeletonText,
} from '@ionic/react'
import {
  star,
  location,
  checkmarkCircle,
  search,
} from 'ionicons/icons'
import './Agencies.css'

interface Agency {
  id: string
  name: string
  logo?: string
  location: string
  verified: boolean
  rating: number
  reviewCount: number
  tripCount: number
  description?: string
}

const Agencies: React.FC = () => {
  const history = useHistory()
  const [searchText, setSearchText] = useState('')
  const [loading, setLoading] = useState(true)
  const [agencies, setAgencies] = useState<Agency[]>([])

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockAgencies: Agency[] = [
        {
          id: '1',
          name: 'Adventurous Tours',
          location: 'Islamabad, Pakistan',
          verified: true,
          rating: 4.8,
          reviewCount: 234,
          tripCount: 24,
          description: 'Specialized in mountain trekking and adventure tours',
        },
        {
          id: '2',
          name: 'Nature Explorers',
          location: 'Lahore, Pakistan',
          verified: true,
          rating: 4.6,
          reviewCount: 189,
          tripCount: 18,
          description: 'Eco-friendly tourism and nature conservation',
        },
        {
          id: '3',
          name: 'Luxury Getaways',
          location: 'Karachi, Pakistan',
          verified: true,
          rating: 4.9,
          reviewCount: 156,
          tripCount: 15,
          description: 'Premium luxury travel experiences',
        },
        {
          id: '4',
          name: 'Budget Backpackers',
          location: 'Peshawar, Pakistan',
          verified: false,
          rating: 4.3,
          reviewCount: 87,
          tripCount: 8,
          description: 'Affordable travel packages for backpackers',
        },
        {
          id: '5',
          name: 'Cultural Journeys',
          location: 'Lahore, Pakistan',
          verified: true,
          rating: 4.7,
          reviewCount: 142,
          tripCount: 20,
          description: 'Explore historical and cultural sites',
        },
        {
          id: '6',
          name: 'Mountain Trails',
          location: 'Gilgit-Baltistan',
          verified: true,
          rating: 4.5,
          reviewCount: 111,
          tripCount: 12,
          description: 'High-altitude trekking and mountaineering',
        },
      ]
      setAgencies(mockAgencies)
      setLoading(false)
    }, 800)
  }, [])

  const filteredAgencies = agencies.filter(
    (agency) =>
      agency.name.toLowerCase().includes(searchText.toLowerCase()) ||
      agency.location.toLowerCase().includes(searchText.toLowerCase())
  )

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <IonIcon
        key={i}
        icon={star}
        className={i < Math.floor(rating) ? 'star-filled' : 'star-empty'}
      />
    ))
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="agencies-header">
          <IonTitle>Travel Agencies</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="agencies-content">
        <div className="agencies-container">
          {/* Search Bar */}
          <div className="search-section">
            <IonSearchbar
              value={searchText}
              onIonChange={(e) => setSearchText(e.detail.value!)}
              placeholder="Search agencies..."
              className="agencies-search"
            />
          </div>

          {/* Agencies List */}
          <div className="agencies-list">
            {loading ? (
              // Loading Skeleton
              Array.from({ length: 3 }).map((_, i) => (
                <IonCard key={i} className="agency-card skeleton-card">
                  <IonCardContent>
                    <div className="agency-card-content">
                      <div className="agency-avatar skeleton"></div>
                      <div className="agency-info">
                        <IonSkeletonText animated style={{ width: '70%', marginBottom: '8px' }} />
                        <IonSkeletonText animated style={{ width: '50%', marginBottom: '8px' }} />
                        <IonSkeletonText animated style={{ width: '60%' }} />
                      </div>
                    </div>
                  </IonCardContent>
                </IonCard>
              ))
            ) : filteredAgencies.length > 0 ? (
              filteredAgencies.map((agency) => (
                <IonCard
                  key={agency.id}
                  className="agency-card"
                  onClick={() => history.push(`/agencies/${agency.id}`)}
                >
                  <IonCardContent>
                    <div className="agency-card-content">
                      {/* Avatar */}
                      <div className="agency-avatar">
                        <div className="avatar-initials">
                          {agency.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .substring(0, 2)
                            .toUpperCase()}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="agency-info">
                        <div className="agency-header">
                          <h3 className="agency-name">{agency.name}</h3>
                          {agency.verified && (
                            <IonIcon icon={checkmarkCircle} className="verified-icon" />
                          )}
                        </div>

                        <div className="agency-location">
                          <IonIcon icon={location} />
                          <span>{agency.location}</span>
                        </div>

                        <div className="agency-rating">
                          <div className="stars">{renderStars(agency.rating)}</div>
                          <span className="rating-text">
                            {agency.rating.toFixed(1)} ({agency.reviewCount} reviews)
                          </span>
                        </div>

                        <p className="agency-description">{agency.description}</p>

                        <div className="agency-stats">
                          <div className="stat">
                            <span className="stat-value">{agency.tripCount}</span>
                            <span className="stat-label">Trips</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </IonCardContent>
                </IonCard>
              ))
            ) : (
              // Empty State
              <div className="empty-state">
                <IonIcon icon={search} />
                <h3>No agencies found</h3>
                <p>Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  )
}

export default Agencies
