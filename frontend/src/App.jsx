import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UploadSong from './pages/UploadSong';
import ManageSongs from './pages/ManageSongs';
import Users from './pages/Users';
import Settings from './pages/Settings';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute adminOnly={true}>
                <div className="flex h-screen bg-gray-50">
                  {/* Sidebar */}
                  <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                  {/* Main Content */}
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Navbar */}
                    <Navbar onToggleSidebar={toggleSidebar} />

                    {/* Page Content */}
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
                      <Routes>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/upload" element={<UploadSong />} />
                        <Route path="/songs" element={<ManageSongs />} />
                        <Route path="/users" element={<Users />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      </Routes>
                    </main>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>

        {/* Toast Notifications */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </Router>
    </AuthProvider>
  );
}

export default App;