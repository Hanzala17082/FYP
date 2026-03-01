import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonInput,
  IonButton,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText,
} from '@ionic/react';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const Login: React.FC = () => {
  const history = useHistory();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'Traveler' | 'Agency'>('Traveler');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated) history.replace('/trips');
  }, [isAuthenticated, history]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password, role);
      history.replace('/trips');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tripster – Login</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <form onSubmit={handleSubmit} className="login-form">
          <IonItem>
            <IonLabel position="stacked">Email</IonLabel>
            <IonInput
              type="email"
              value={email}
              onIonInput={(e) => setEmail(e.detail.value || '')}
              required
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Password</IonLabel>
            <IonInput
              type="password"
              value={password}
              onIonInput={(e) => setPassword(e.detail.value || '')}
              required
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Role</IonLabel>
            <IonSelect value={role} onIonChange={(e) => setRole(e.detail.value)}>
              <IonSelectOption value="Traveler">Traveler</IonSelectOption>
              <IonSelectOption value="Agency">Agency</IonSelectOption>
            </IonSelect>
          </IonItem>
          {error && (
            <IonText color="danger">
              <p className="ion-padding-start">{error}</p>
            </IonText>
          )}
          <IonButton type="submit" expand="block" disabled={loading} className="ion-margin-top">
            {loading ? <IonSpinner name="crescent" /> : 'Log in'}
          </IonButton>
        </form>
      </IonContent>
    </IonPage>
  );
};

export default Login;
