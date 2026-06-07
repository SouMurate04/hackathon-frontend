import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword, sendEmailVerification, } from "firebase/auth";
import { fireAuth } from "../firebase";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await createUserWithEmailAndPassword(fireAuth, email, password);
      
      const response = await fetch(`${API_BASE_URL}/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: userCredential.user.email,
      }),
    });

    if (!response.ok) {
      throw new Error("バックエンドへのユーザー登録に失敗しました");
    }
      
      await sendEmailVerification(userCredential.user);
      alert("登録確認メールを送信しました。メールを確認してください。");
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