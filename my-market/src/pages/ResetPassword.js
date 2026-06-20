import { useState } from "react";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { fireAuth } from "../firebase";

export default function ResetPassword() {
  const [email, setEmail] = useState("");

  const handleResetPassword = async (e) => {
    e.preventDefault();

    try {
      await sendPasswordResetEmail(fireAuth, email);
      alert("パスワード再設定用のメールを送信しました。");
    } catch (err) {
      console.error(err);
      alert("メール送信に失敗しました。");
    }
  };

  document.title = "パスワードリセット | WhatsOnSale";

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">パスワード再設定</h1>

        <form className="auth-form" onSubmit={handleResetPassword}>
          <label className="auth-field">
            <span>登録済みメールアドレス</span>
            <input
              type="email"
              placeholder="example@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <button className="auth-submit" type="submit">再設定メールを送信</button>
        </form>

        <div className="auth-links">
          <span><Link to="/login">ログイン画面に戻る</Link></span>
        </div>
      </div>
    </div>
  );
}