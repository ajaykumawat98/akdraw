import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/utils/api';
import Layout from '@/components/Layout';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import CanvasPage from '@/pages/CanvasPage';
import DashboardPage from '@/pages/DashboardPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  const { setUser, setLoading, token } = useAuthStore();

  useEffect(() => {
    if (token) {
      setLoading(true);
      authApi.me()
        .then((res) => {
          setUser(res.data.user);
        })
        .catch(() => {
          // Token invalid, will be handled by interceptor
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [token, setUser, setLoading]);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="dashboard" element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        } />
        <Route path="canvas/:canvasId" element={
          <PrivateRoute>
            <CanvasPage />
          </PrivateRoute>
        } />
      </Route>
    </Routes>
  );
}

export default App;
