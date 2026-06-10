import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";

import { Link, useNavigate } from "react-router-dom";
import { fireAuth } from "../firebase";

export default function Header() {

  const [loginUser, setLoginUser] = useState(fireAuth.currentUser);
  const navigate = useNavigate();

  const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(fireAuth, user => {
      setLoginUser(user);
    });

    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    await signOut(fireAuth);
    navigate("/");
  };

  const handleMyPage = async () => {
    const token = await fireAuth.currentUser.getIdToken();

    const response = await fetch(`${REACT_APP_API_BASE_URL}/user/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const user = await response.json();

    if (!response.ok) {
      alert("ユーザー情報の取得に失敗しました");
      return;
    }

    navigate(`/user/${user.id}`);
  };


  return (
    <header>

      <Link to="/">Home</Link>

      {loginUser ? (
        <>
          {" | "}
          <button onClick={handleMyPage}>{loginUser.displayName || "ユーザー"}さん</button>

          {" | "}
          <Link to="/notifications">Notifications</Link>

          {" | "}
          <Link to="/sell">出品</Link>

          {" | "}
          <button
            type="button"
            onClick={handleLogout}
            style={{
              background: "none",
              border: "none",
              color: "#61dafb",
              cursor: "pointer",
              font: "inherit",
              padding: 0,
              textDecoration: "underline",
            }}
          >
            Logout
          </button>
        </>
      ) : (
        <>
          {" | "}
          <Link to="/login">Login</Link>

          {" | "}
          <Link to="/signup">Signup</Link>
        </>
      )}

      <hr />
    </header>
  );
}
