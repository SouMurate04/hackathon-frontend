import appLogo from "../images/AppLogo.png";
import bellIcon from "../images/Bell.png";

import { useState, useEffect, useRef } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";

import { Link, useNavigate, useLocation } from "react-router-dom";
import { fireAuth } from "../firebase";

export default function Header() {

  const [loginUser, setLoginUser] = useState(fireAuth.currentUser);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup" || location.pathname === "/reset-password";

  const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(fireAuth, async (user) => {
      setLoginUser(user);
      setIsUserMenuOpen(false);

      if (!user) {
        setCurrentUserProfile(null);
        setUnreadCount(0);
        return;
      }

      try {
        const token = await user.getIdToken();

        const response = await fetch(`${REACT_APP_API_BASE_URL}/user/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) return;

        const profile = await response.json();
        setCurrentUserProfile(profile);
      } catch (err) {
        console.error(err);
      }
    });

    return unsubscribe;
  }, [REACT_APP_API_BASE_URL]);

  const handleMyPage = () => {
    if (!currentUserProfile) {
      alert("ユーザー情報の取得に失敗しました");
      return;
    }

    setIsUserMenuOpen(false);
    navigate(`/user/${currentUserProfile.id}`);
  };

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    await signOut(fireAuth);
    navigate("/");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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
            <Link to="/notification" className="header-icon-link" aria-label="通知">
              <img src={bellIcon} alt="通知" className="header-bell-icon" />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </Link>

            <Link to="/sell" className="header-nav-item">
              出品
            </Link>

            <div className="header-user-menu" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                className="header-user-button"
              >
                <img
                  src={currentUserProfile?.icon_url || loginUser.photoURL}
                  alt={currentUserProfile?.name || loginUser.displayName || "ユーザー"}
                  className="header-user-icon"
                />
                <span className="header-user-name">
                  {currentUserProfile?.name || loginUser.displayName || "ユーザー"}
                </span>
              </button>

              {isUserMenuOpen && (
                <div className="header-user-dropdown">
                  <button
                    type="button"
                    onClick={handleMyPage}
                    className="header-dropdown-item"
                  >
                    マイページ
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="header-dropdown-item"
                  >
                    ログアウト
                  </button>
                </div>
              )}
            </div>
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
