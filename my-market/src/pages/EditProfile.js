import { fireAuth } from "../firebase";
import { useState, useEffect, use } from "react";

import { useNavigate, Link } from "react-router-dom";
import { updateProfile, } from "firebase/auth";

export default function EditProfile() {

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";
    const DEFAULT_ICON_URL = process.env.REACT_APP_DEFAULT_ICON_URL;

    const user = fireAuth.currentUser;
    const [icon, setIcon] = useState(DEFAULT_ICON_URL);
    const [name, setName] = useState(user.displayName);
    const [email, setEmail] = useState(user.email);
    const [bio, setBio] = useState("");

    const [wantSetPassword, setWantSetPassword] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");

    const [error, setError] = useState("");
    const navigate = useNavigate();
    
    useEffect(() => {
        const load_user = async () =>{
            try{
              const user_response = await fetch(`${API_BASE_URL}/user/me`, { method: "GET" });
              const user_ret = await user_response.json();
              if(!user_response.ok){
                console.error(user_ret);
                alert("Error：" + JSON.stringify(user_ret));
                return;
              }

              setBio(user_ret.bio);
              setIcon(user_ret.icon_url);
            }catch(err){
                alert(err.message);
                console.error(err.message);
            }
        };
        load_user();

    }, [API_BASE_URL]);


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
                }else if(!password){
                    throw new Error("新しいパスワードが空です");
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
                    bio: bio,
                    icon: icon,
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

    const deleteIcon = () => {
        setIcon(DEFAULT_ICON_URL);
    }

  return (
    <div>
      <div>
        <h1>Edit Profile</h1>
        <form onSubmit={handleEditProfile}>
            <img src={icon} alt={name} />
            <button onClick={deleteIcon}>アイコンを削除</button>
            <input type="file" accept="image/*"
            onChange={(e) => setIcon(e.target.files[0])} 
            />

            <input type="text" placeholder="ニックネーム" value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input type="text" placeholder="プロフィール" value={bio}
              onChange={(e) => setBio(e.target.value)}
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