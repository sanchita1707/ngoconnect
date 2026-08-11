import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import BottomNavigation from './components/BottomNavigation';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Landing from './pages/Landing';
import About from './pages/About';
import Opportunities from './pages/Opportunities';
import OpportunityDetail from './pages/OpportunityDetail';
import NGOs from './pages/NGOs';
import NGODetail from './pages/NGODetail';
import Resources from './pages/Resources';
import Campaigns from './pages/Campaigns';
import Events from './pages/Events';
import Stories from './pages/Stories';
import Leaderboard from './pages/Leaderboard';
import ImpactMap from './pages/ImpactMap';
import ActivityFeed from './pages/ActivityFeed';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';

// Volunteer Dashboards & Subpages
import VolunteerDashboard from './pages/VolunteerDashboard';
import VolunteerProfile from './pages/VolunteerProfile';
import VolunteerCalendar from './pages/VolunteerCalendar';
import VolunteerApplications from './pages/VolunteerApplications';
import SavedOpportunities from './pages/SavedOpportunities';
import ParticipationHistory from './pages/ParticipationHistory';
import ImpactDashboard from './pages/ImpactDashboard';
import Certificates from './pages/Certificates';

// NGO Dashboards & Subpages
import NGODashboard from './pages/NGODashboard';
import NGOProfile from './pages/NGOProfile';
import NGOOpportunities from './pages/NGOOpportunities';
import NGOApplications from './pages/NGOApplications';
import NGOVolunteers from './pages/NGOVolunteers';
import NGOResources from './pages/NGOResources';
import NGOCampaigns from './pages/NGOCampaigns';
import NGOEvents from './pages/NGOEvents';

// Admin Dashboards & Subpages
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminNGOs from './pages/AdminNGOs';
import AdminOpportunities from './pages/NGOOpportunities'; // Can reuse the same beautiful component for opportunity audits
import AdminResources from './pages/NGOResources'; // Can reuse the same beautiful component for resource audits
import AdminReports from './pages/AdminReports';
import AdminCategories from './pages/AdminCategories';

// Unified Layout wrapper
const AppLayout = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Detect if dashboard layout (Sidebar is displayed)
  const isDashboard = location.pathname.includes('/volunteer/') || 
                      location.pathname.includes('/ngo/') || 
                      location.pathname.includes('/admin/');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-charcoal-dark text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-300">
      <Navbar />
      {isDashboard && user ? (
        <div className="flex flex-1 relative">
          <Sidebar />
          <main className="flex-1 pb-20 md:pb-6 overflow-x-hidden">
            {children}
          </main>
          <BottomNavigation />
        </div>
      ) : (
        <main className="flex-grow">
          {children}
        </main>
      )}
      {!isDashboard && <Footer />}
    </div>
  );
};

const AppContent = () => {
  return (
    <AppLayout>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/opportunities" element={<Opportunities />} />
        <Route path="/opportunities/:id" element={<OpportunityDetail />} />
        <Route path="/ngos" element={<NGOs />} />
        <Route path="/ngos/:id" element={<NGODetail />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/events" element={<Events />} />
        <Route path="/stories" element={<Stories />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/impact-map" element={<ImpactMap />} />
        <Route path="/activity" element={<ActivityFeed />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Volunteer Routes */}
        <Route path="/volunteer/dashboard" element={
          <ProtectedRoute allowedRoles={['volunteer']}><VolunteerDashboard /></ProtectedRoute>
        } />
        <Route path="/volunteer/profile" element={
          <ProtectedRoute allowedRoles={['volunteer']}><VolunteerProfile /></ProtectedRoute>
        } />
        <Route path="/volunteer/calendar" element={
          <ProtectedRoute allowedRoles={['volunteer']}><VolunteerCalendar /></ProtectedRoute>
        } />
        <Route path="/volunteer/applications" element={
          <ProtectedRoute allowedRoles={['volunteer']}><VolunteerApplications /></ProtectedRoute>
        } />
        <Route path="/volunteer/saved" element={
          <ProtectedRoute allowedRoles={['volunteer']}><SavedOpportunities /></ProtectedRoute>
        } />
        <Route path="/volunteer/participation" element={
          <ProtectedRoute allowedRoles={['volunteer']}><ParticipationHistory /></ProtectedRoute>
        } />
        <Route path="/volunteer/impact" element={
          <ProtectedRoute allowedRoles={['volunteer']}><ImpactDashboard /></ProtectedRoute>
        } />
        <Route path="/volunteer/certificates" element={
          <ProtectedRoute allowedRoles={['volunteer']}><Certificates /></ProtectedRoute>
        } />

        {/* Protected NGO Routes */}
        <Route path="/ngo/dashboard" element={
          <ProtectedRoute allowedRoles={['ngo']}><NGODashboard /></ProtectedRoute>
        } />
        <Route path="/ngo/profile" element={
          <ProtectedRoute allowedRoles={['ngo']}><NGOProfile /></ProtectedRoute>
        } />
        <Route path="/ngo/opportunities" element={
          <ProtectedRoute allowedRoles={['ngo']}><NGOOpportunities /></ProtectedRoute>
        } />
        <Route path="/ngo/applications" element={
          <ProtectedRoute allowedRoles={['ngo']}><NGOApplications /></ProtectedRoute>
        } />
        <Route path="/ngo/volunteers" element={
          <ProtectedRoute allowedRoles={['ngo']}><NGOVolunteers /></ProtectedRoute>
        } />
        <Route path="/ngo/resources" element={
          <ProtectedRoute allowedRoles={['ngo']}><NGOResources /></ProtectedRoute>
        } />
        <Route path="/ngo/campaigns" element={
          <ProtectedRoute allowedRoles={['ngo']}><NGOCampaigns /></ProtectedRoute>
        } />
        <Route path="/ngo/events" element={
          <ProtectedRoute allowedRoles={['ngo']}><NGOEvents /></ProtectedRoute>
        } />

        {/* Protected Admin Routes */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>
        } />
        <Route path="/admin/ngos" element={
          <ProtectedRoute allowedRoles={['admin']}><AdminNGOs /></ProtectedRoute>
        } />
        <Route path="/admin/opportunities" element={
          <ProtectedRoute allowedRoles={['admin']}><AdminOpportunities /></ProtectedRoute>
        } />
        <Route path="/admin/resources" element={
          <ProtectedRoute allowedRoles={['admin']}><AdminResources /></ProtectedRoute>
        } />
        <Route path="/admin/reports" element={
          <ProtectedRoute allowedRoles={['admin']}><AdminReports /></ProtectedRoute>
        } />
        <Route path="/admin/categories" element={
          <ProtectedRoute allowedRoles={['admin']}><AdminCategories /></ProtectedRoute>
        } />

        {/* Catch-all 404 Route */}
        <Route path="*" element={
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
            <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white">404</h1>
            <p className="text-slate-500 mt-2">The page you requested does not exist.</p>
            <Link to="/" className="mt-6 px-5 py-2.5 bg-primary text-white rounded-xl font-bold shadow-md hover:bg-primary-dark">
              Go Home
            </Link>
          </div>
        } />
      </Routes>
    </AppLayout>
  );
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
