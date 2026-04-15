import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonSpinner,
  IonButton,
  IonButtons,
  IonText,
} from '@ionic/react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import type { TripDTO, TripListResponseDTO } from '../types/api';
import './Trips.css';

const Trips: React.FC = () => {
  const history = useHistory();
  const { isAuthenticated, logout } = useAuth();
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

  const handleLogout = () => {
    logout();
    history.replace('/login');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Trips</IonTitle>
          <IonButtons slot="end">
            {isAuthenticated ? (
              <>
                <IonButton routerLink="/profile" fill="clear" size="small">
                  Profile
                </IonButton>
                <IonButton onClick={handleLogout} fill="clear" size="small">
                  Logout
                </IonButton>
              </>
            ) : (
              <IonButton routerLink="/login" fill="clear">
                Login
              </IonButton>
            )}
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <div style={{ marginBottom: '2rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <IonButton routerLink="/home" fill="outline" size="small">Home</IonButton>
          <IonButton routerLink="/agencies" fill="outline" size="small">Agencies</IonButton>
          <IonButton routerLink="/register" fill="outline" size="small">Register</IonButton>
          {isAuthenticated && (
            <IonButton routerLink="/dashboard" fill="outline" size="small">Dashboard</IonButton>
          )}
        </div>

        {loading && (
          <div className="ion-text-center ion-padding">
            <IonSpinner name="crescent" />
          </div>
        )}
        {error && <p className="ion-text-center ion-text-danger">{error}</p>}
        {!loading && trips.length === 0 && (
          <IonText>
            <p className="ion-text-center">No trips available</p>
          </IonText>
        )}
        {!loading && !error && trips.length > 0 && (
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
