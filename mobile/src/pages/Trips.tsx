import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonSpinner,
  IonButton,
} from '@ionic/react';
import { api } from '../lib/api';
import type { TripDTO, TripListResponseDTO } from '../types/api';
import './Trips.css';

const Trips: React.FC = () => {
  const history = useHistory();
  const [trips, setTrips] = useState<TripDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api<TripListResponseDTO>('/trips?limit=20');
        if (!cancelled && res.data?.trips) setTrips(res.data.trips);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load trips');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Trips</IonTitle>
          <IonButton slot="end" fill="clear" onClick={() => history.push('/login')}>
            Login
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        {loading && (
          <div className="ion-text-center ion-padding">
            <IonSpinner name="crescent" />
          </div>
        )}
        {error && <p className="ion-text-center ion-text-danger">{error}</p>}
        {!loading && !error && (
          <IonList>
            {trips.map((t) => (
              <IonCard key={t.id} button onClick={() => history.push(`/trips/${t.slug}`)}>
                <IonCardHeader>
                  <IonCardTitle>{t.title}</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <p>{t.shortDescription}</p>
                  <p><strong>{t.destination}</strong> · ${t.price} · {t.duration} days</p>
                </IonCardContent>
              </IonCard>
            ))}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Trips;
