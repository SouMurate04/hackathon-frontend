import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";

import { Link } from "react-router-dom";
import { fireAuth } from "../firebase";

export default function Header() {

  const [loginUser, setLoginUser] = useState(fireAuth.currentUser);
  useEffect(() => {
    onAuthStateChanged(fireAuth, user => {
      setLoginUser(user);
    });
  }, []);


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