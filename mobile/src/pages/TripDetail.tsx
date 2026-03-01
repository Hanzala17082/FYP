import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonBackButton,
  IonButtons,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonSpinner,
} from '@ionic/react';
import { api } from '../lib/api';
import type { TripDTO } from '../types/api';
import './TripDetail.css';

const TripDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const history = useHistory();
  const [trip, setTrip] = useState<TripDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await api<TripDTO>(`/trips/${slug}`);
        if (!cancelled && res.data) setTrip(res.data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load trip');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/trips" />
          </IonButtons>
          <IonTitle>{trip?.title || 'Trip'}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        {loading && (
          <div className="ion-text-center ion-padding">
            <IonSpinner name="crescent" />
          </div>
        )}
        {error && <p className="ion-text-center ion-text-danger">{error}</p>}
        {!loading && trip && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>{trip.title}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p><strong>{trip.destination}</strong></p>
              <p>${trip.price} · {trip.duration} days</p>
              <p>{trip.description}</p>
              <p>By {trip.agency?.name} · Rating {trip.rating}</p>
              <p>Dates: {trip.startDate} – {trip.endDate}</p>
            </IonCardContent>
          </IonCard>
        )}
      </IonContent>
    </IonPage>
  );
};

export default TripDetail;
