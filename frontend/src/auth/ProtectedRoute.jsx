import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";

// Wrap a page that needs a logged-in user.
export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}
