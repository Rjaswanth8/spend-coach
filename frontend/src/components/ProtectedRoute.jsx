import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from './UI';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 40 }}>💰</div>
        <Spinner size={32} />
        <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Loading SpendCoach…</p>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}
