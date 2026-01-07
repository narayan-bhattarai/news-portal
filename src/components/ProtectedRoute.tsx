import { Navigate } from 'react-router-dom';
import { api } from '../services/api';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    if (!api.isLoggedIn()) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
}
