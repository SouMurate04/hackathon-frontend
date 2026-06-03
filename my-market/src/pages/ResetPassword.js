import { useState } from "react";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { fireAuth } from "../firebase";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      await sendPasswordResetEmail(fireAuth, email);
      setMessage("パスワード再設定用のメールを送信しました。");
    } catch (err) {
      console.error(err);
      setError("メール送信に失敗しました。");
    }
  };

  return (
    <div>
      <h1>パスワード再設定</h1>

      <form onSubmit={handleResetPassword}>
        <input
          type="email"
          placeholder="登録済みメールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button type="submit">再設定メールを送信</button>
      </form>

      {message && <p>{message}</p>}
      {error && <p>{error}</p>}

      <Link to="/login">ログイン画面に戻る</Link>
    </div>
  );
}