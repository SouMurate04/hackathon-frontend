import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";

import { Link, useNavigate } from "react-router-dom";
import { fireAuth } from "../firebase";

export default function Header() {

  const [loginUser, setLoginUser] = useState(fireAuth.currentUser);
  const navigate = useNavigate();

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


  return (
    <header>

      <Link to="/">Home</Link>

      {loginUser ? (
        <>
          {" | "}
          <Link to="/mypage">{loginUser.email}さん</Link>

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
