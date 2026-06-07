import { Link } from "react-router-dom";
import { auth } from "../firebase";

export default function Header() {

  const user = auth.currentUser;

  return (
    <header>

      <Link to="/">Home</Link>

      {user ? (
        <>
          {" | "}
          <Link to="/mypage">{user.email}さん</Link>

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