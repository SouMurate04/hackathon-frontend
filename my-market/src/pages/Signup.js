import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile, } from "firebase/auth";
import { fireAuth } from "../firebase";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

  const handleSignup = async (e) => {
    e.preventDefault();

    try {

      if(email == null || password == null){
        throw new Error("値の入力が不十分です");
      }

      const userCredential = await createUserWithEmailAndPassword(fireAuth, email, password);     
      await updateProfile(userCredential.user, { displayName: "ユーザー", });

      const token = await userCredential.user.getIdToken();
      const response = await fetch(`${API_BASE_URL}/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
      console.error(err.message);
      alert(err.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">SignUp</h1>

        <form className="auth-form" onSubmit={handleSignup}>
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
              placeholder="強度の高いパスワードを推奨します"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <button className="auth-submit" type="submit">アカウントを作成</button>
        </form>

        <div className="auth-links">
          <span>すでにアカウントがある場合は <Link to="/login">ログイン</Link></span>
        </div>
      </div>
    </div>
  );
}