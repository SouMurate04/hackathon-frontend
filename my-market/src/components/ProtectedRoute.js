import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";

import { Navigate } from "react-router-dom";
import { fireAuth } from "../firebase";

export default function ProtectedRoute({ children }) {
  const [loginUser, setLoginUser] = useState(fireAuth.currentUser);
  useEffect(() => {
    onAuthStateChanged(fireAuth, user => {
      setLoginUser(user);
    });
  }, []);

  if (!loginUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
}