import appLogo from "../images/AppLogo.png";

import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";

import { Link, useNavigate, useLocation } from "react-router-dom";
import { fireAuth } from "../firebase";

export default function Header() {

  const [loginUser, setLoginUser] = useState(fireAuth.currentUser);
  const [unreadCount, setUnreadCount] = useState(0);
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup" || location.pathname === "/reset-password";

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

          const res = await fetch(`${REACT_APP_API_BASE_URL}/notification/unread-count`, {
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

  const handleSearch = (e) => {
    e.preventDefault();

    const trimmedKeyword = keyword.trim();

    if (!trimmedKeyword) {
      navigate("/");
      return;
    }

    navigate(`/browse?keyword=${encodeURIComponent(trimmedKeyword)}`);
  };

  return (
    <header className={`app-header ${isAuthPage ? "auth-header" : ""}`}>
      <Link to="/" className="header-logo-link">
        <img src={appLogo} alt="Home" id="logo" />
      </Link>

      {!isAuthPage && (
      <>

      <form onSubmit={handleSearch} className="header-search">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="商品を検索"
        />
        <button type="submit">検索</button>
      </form>

      <nav className="header-nav">
        {loginUser ? (
          <>
            <button
              type="button"
              onClick={handleMyPage}
              className="header-nav-item"
            >
              {loginUser.displayName || "ユーザー"}さん
            </button>

            <Link to="/notification" className="header-nav-item">
              通知
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </Link>

            <Link to="/sell" className="header-nav-item">
              出品
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="header-nav-item"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="header-nav-item">
              Login
            </Link>

            <Link to="/signup" className="header-nav-item">
              Signup
            </Link>
          </>
        )}
      </nav>

      </>
      )}
    </header>
  );
}
