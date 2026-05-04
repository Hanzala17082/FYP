import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Trips from './pages/Trips';
import TripDetail from './pages/TripDetail';
import Agencies from './pages/Agencies';
import AgencyDetail from './pages/AgencyDetail';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Dark mode */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <AuthProvider>
      <IonReactRouter>
        <IonRouterOutlet>
          {/* Public Routes - No Auth Required */}
          <Route exact path="/">
            <Home />
          </Route>

          <Route exact path="/home">
            <Home />
          </Route>

          <Route exact path="/login">
            <Login />
          </Route>

          <Route exact path="/register">
            <Register />
          </Route>

          <Route exact path="/forgot-password">
            <ForgotPassword />
          </Route>

          {/* Trip Routes */}
          <Route exact path="/trips">
            <Trips />
          </Route>

          <Route exact path="/trips/:slug">
            <TripDetail />
          </Route>

          {/* Agency Routes */}
          <Route exact path="/agencies">
            <Agencies />
          </Route>

          <Route exact path="/agencies/:id">
            <AgencyDetail />
          </Route>

          {/* Dashboard Routes */}
          <Route exact path="/dashboard">
            <Dashboard />
          </Route>

          <Route exact path="/traveler/dashboard">
            <Dashboard />
          </Route>

          <Route exact path="/agency/dashboard">
            <Dashboard />
          </Route>

          <Route exact path="/admin/dashboard">
            <AdminDashboard />
          </Route>

          <Route exact path="/admin/login">
            <Login />
          </Route>

          {/* Profile Routes */}
          <Route exact path="/profile">
            <Profile />
          </Route>

          <Route exact path="/travelers/:id">
            <Profile />
          </Route>

          {/* Catch-all - redirect to home */}
          <Route render={() => <Redirect to="/home" />} />
        </IonRouterOutlet>
      </IonReactRouter>
    </AuthProvider>
  </IonApp>
);

export default App;
