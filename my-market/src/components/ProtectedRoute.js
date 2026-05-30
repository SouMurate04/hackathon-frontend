import { Navigate } from "react-router-dom";
import { fireAuth } from "../firebase";

export default function ProtectedRoute({ children }) {
  const user = fireAuth.currentUser;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}