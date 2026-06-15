import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";

import { Link, useNavigate } from "react-router-dom";
import { fireAuth } from "../firebase";

export default function Header() {

  const [loginUser, setLoginUser] = useState(fireAuth.currentUser);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(fireAuth, user => {
      setLoginUser(user);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
      const loadUnreadCount = async () => {
          if (!fireAuth.currentUser) return;

          const token = await fireAuth.currentUser.getIdToken();

          const res = await fetch(`${API_BASE_URL}/notification/unread-count`, {
              headers: {
                  Authorization: `Bearer ${token}`,
              },
          });

          if (!res.ok) return;

          const data = await res.json();
          setUnreadCount(data.unread_count);
      };

      loadUnreadCount();
  }, [REACT_APP_API_BASE_URL]);

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
          <Link to="/notification">
              通知
              {unreadCount > 0 && <span>{unreadCount}</span>}
          </Link>          

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
