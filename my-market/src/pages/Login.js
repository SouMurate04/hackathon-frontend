import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { fireAuth } from "../firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      await signInWithEmailAndPassword(fireAuth, email, password);
      navigate("/");
    } catch (err) {
      alert("ログインに失敗しました");
      console.error(err);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Login</h1>

        <form className="auth-form" onSubmit={handleLogin}>
          <label className="auth-field">
            <span>メールアドレス</span>
            <input
              type="email"
              placeholder="example@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="auth-field">
            <span>パスワード</span>
            <input
              type="password"
              placeholder="頑張って思い出してください"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <button className="auth-submit" type="submit">ログイン</button>
        </form>

        <div className="auth-links">
          <span>アカウントがない場合は <Link to="/signup">新規作成</Link></span>
          <span>パスワードを忘れた方は <Link to="/reset-password">こちら</Link></span>
        </div>
      </div>
    </div>
  );
}