import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { fireAuth } from "../firebase";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await createUserWithEmailAndPassword(fireAuth, email, password);
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("アカウント作成に失敗しました");
    }
  };

  return (
    <div>
      <h1>新規作成</h1>

      <form onSubmit={handleSignup}>
        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">アカウント作成</button>
      </form>

      {error && <p>{error}</p>}

      <p>
        すでにアカウントがある場合は <Link to="/login">ログイン</Link>
      </p>
    </div>
  );
}