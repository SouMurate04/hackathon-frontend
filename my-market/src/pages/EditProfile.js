import { fireAuth } from "../firebase";
import { useState } from "react";

import { useNavigate, Link } from "react-router-dom";
import { updateProfile, } from "firebase/auth";

export default function EditProfile() {

    const user = fireAuth.currentUser;
    const [name, setName] = useState(user.displayName);
    const [email, setEmail] = useState(user.email);

    const [wantSetPassword, setWantSetPassword] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");

    const [error, setError] = useState("");
    const navigate = useNavigate();

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";
    
    const handleEditProfile = async (e) => {
        e.preventDefault();
        setError("");

        try {
            if(name == null || email == null){
                throw new Error("名前もしくはメールアドレスが空です");
            }
            
            if(wantSetPassword){
                if(oldPassword !== user.password){
                    throw new Error("変更前のパスワードが間違っています");
                }else if(password !== password2){
                    throw new Error("新しいパスワードが一致しません");
                }
            }

            const token = await fireAuth.currentUser.getIdToken();

            const response = await fetch(`${API_BASE_URL}/user`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                }),
            });
            const user_ret = await response.json();

            if (!response.ok) {
                throw new Error("バックエンドでのプロフィール更新に失敗しました");
            }    
            
            const newProfile = { displayName: name, email: email };
            if(wantSetPassword){
                newProfile.password = password;
            }

            await updateProfile(user, newProfile);
            alert("プロフィールを変更しました");
            navigate(`/user/${user_ret.id}`);
        } catch (err) {
            console.error(err);
            setError(err.message);
        }
    };

  return (
    <div>
      <div>
        <h1>Edit Profile</h1>
        <form onSubmit={handleEditProfile}>
            <input type="text" placeholder="ニックネーム" value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input type="email" placeholder="メールアドレス" value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input type="checkbox" checked={wantSetPassword}
              onChange={(e) => setWantSetPassword(e.target.checked)}
            /> パスワードを再設定する

            {wantSetPassword && <p>
            <input type="password" placeholder="変更前のパスワード" value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />

            <input type="password" placeholder="パスワード" value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <input type="password2" placeholder="パスワード(確認のため再入力)" value={password2}
              onChange={(e) => setPassword2(e.target.value)}
            />
            
            <Link to="/reset-password">パスワードを忘れた場合はこちら</Link>
            </p>}

            <button type="submit">変更を確定</button>
        </form>

        {error && <p>{error}</p>}
      </div>
    </div>
  );
}