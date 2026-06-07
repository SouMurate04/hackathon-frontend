import { fireAuth } from "../firebase";

export default function MyPage() {

  const user = fireAuth.currentUser;

  return (
    <div>
      <div>
        <h1>User Information</h1>
        <p>ニックネーム:{user.displayName}</p>
        <p>メールアドレス:{user.email}</p>
      </div>
    </div>
  );
}