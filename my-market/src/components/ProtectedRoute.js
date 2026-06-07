import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";

import { Navigate } from "react-router-dom";
import { fireAuth } from "../firebase";

export default function ProtectedRoute({ children }) {
  const [loginUser, setLoginUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(fireAuth, user => {
      setLoginUser(user);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!loginUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
