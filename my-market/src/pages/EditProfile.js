import { fireAuth } from "../firebase";
import { useState, useEffect } from "react";

import { useNavigate, Link } from "react-router-dom";
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential, } from "firebase/auth";

export default function EditProfile() {

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";
    const DEFAULT_ICON_URL = process.env.REACT_APP_DEFAULT_ICON_URL;

    const user = fireAuth.currentUser;
    
    const [iconUrl, setIconUrl] = useState(DEFAULT_ICON_URL);
    const [icon, setIcon] = useState(null);

    const [name, setName] = useState(user.displayName);
    const [email, setEmail] = useState(user.email);
    const [bio, setBio] = useState("");

    const [deliveryPlaceType, setDeliveryPlaceType] = useState("");
    const [postalCode, setPostalCode] = useState("");
    const [addressCity, setAddressCity] = useState("");
    const [addressStreet, setAddressStreet] = useState("");
    const [addressBuilding, setAddressBuilding] = useState("");

    const [wantSetPassword, setWantSetPassword] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");

    const navigate = useNavigate();
    
    useEffect(() => {
        const load_user = async () =>{
            try{

              const token = await fireAuth.currentUser.getIdToken();

              const user_response = await fetch(`${API_BASE_URL}/user/me`, 
                { 
                  method: "GET" ,
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                });
              const user_ret = await user_response.json();
              if(!user_response.ok){
                console.error(user_ret);
                alert("Error：" + JSON.stringify(user_ret));
                return;
              }

              setBio(user_ret.bio);
              setIconUrl(user_ret.icon_url || DEFAULT_ICON_URL);
              setDeliveryPlaceType(user_ret.delivery_place_type || "");
              setPostalCode(user_ret.postal_code || "");
              setAddressCity(user_ret.address_city || "");
              setAddressStreet(user_ret.address_street || "");
              setAddressBuilding(user_ret.address_building || "");
            }catch(err){
                alert(err.message);
                console.error(err.message);
            }
        };
        load_user();

    }, [API_BASE_URL, DEFAULT_ICON_URL]);


    const isHomeDelivery =
        deliveryPlaceType === "home_handoff" ||
        deliveryPlaceType === "home_delivery_box";

    const isPickupPoint = deliveryPlaceType === "pickup_point";

    const isAddressValid =
        !deliveryPlaceType ||
        (isHomeDelivery && postalCode && addressCity && addressStreet) ||
        (isPickupPoint && postalCode && addressCity && addressBuilding);

    const handleEditProfile = async (e) => {
        e.preventDefault();
        

        try {
            if(name == null || email == null){
                throw new Error("名前もしくはメールアドレスが空です");
            }
            if (!isAddressValid) {
                throw new Error("配送先情報が不足しています");
            }

            const token = await fireAuth.currentUser.getIdToken();

            const formData = new FormData();
            formData.append("name", name);
            formData.append("email", email);
            formData.append("bio", bio || "");
            formData.append("icon_url", iconUrl || DEFAULT_ICON_URL);
            formData.append("delivery_place_type", deliveryPlaceType);
            formData.append("postal_code", postalCode);
            formData.append("address_city", addressCity);
            formData.append("address_street", addressStreet);
            formData.append("address_building", addressBuilding);

            if(icon){
              formData.append("icon", icon);
            }

            const response = await fetch(`${API_BASE_URL}/user`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });
            const user_ret = await response.json();

            if (!response.ok) {
                throw new Error("バックエンドでのプロフィール更新に失敗しました");
            }    
            
            await updateProfile(user, {
                displayName: name,
                photoURL: iconUrl || DEFAULT_ICON_URL,
            });

            if (wantSetPassword) {
                if (!oldPassword) {
                    throw new Error("変更前のパスワードを入力してください");
                }
                if (!password) {
                    throw new Error("新しいパスワードを入力してください");
                }
                if (password !== password2) {
                    throw new Error("新しいパスワードが一致しません");
                }
                const credential = EmailAuthProvider.credential(
                    user.email,
                    oldPassword
                );

                await reauthenticateWithCredential(user, credential);
                await updatePassword(user, password);
            }

            await user.getIdToken(true);

            alert("プロフィールを変更しました");
            navigate(`/user/${user_ret.id}`);
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };

    const deleteIcon = () => {
        setIcon(null);
        setIconUrl(DEFAULT_ICON_URL);
    }

    const fillAddressByPostalCode = async () => {
        try {
            

            const code = postalCode.replace("-", "");

            if (!code) {
                throw new Error("郵便番号を入力してください");
            }

            const response = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${code}`);
            const data = await response.json();

            if (!data.results || data.results.length === 0) {
                throw new Error("住所が見つかりませんでした");
            }

            const result = data.results[0];

            setAddressCity(`${result.address1}${result.address2}`);
            setAddressStreet(result.address3);
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };

    document.title = `登録情報編集 | ${name} | WhatsOnSale`

  return (
    <div className="edit-profile-page">
        <h1 className="edit-profile-title">Edit User Information</h1>
        <form className="edit-profile-form" onSubmit={handleEditProfile}>
            <section className="edit-profile-section">
            <h2>アイコン</h2>

            <div className="profile-icon-editor">
                <img className="profile-icon-preview" src={iconUrl} alt={name} />

                <div className="profile-icon-actions">
                <label className="profile-icon-button">
                    アイコンを選択
                    <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        setIcon(file);
                        setIconUrl(URL.createObjectURL(file));
                    }}
                    />
                </label>

                <button
                    className="profile-icon-button danger"
                    type="button"
                    onClick={deleteIcon}
                >
                    アイコンを削除
                </button>
                </div>
            </div>
            </section>

            <section className="edit-profile-section">
            <h2>基本情報</h2>

            <label className="edit-profile-field">
                <span>ニックネーム</span>
                <input
                type="text"
                placeholder="例: 山田太郎"
                value={name}
                onChange={(e) => setName(e.target.value)}
                />
            </label>

            <label className="edit-profile-field">
                <span>プロフィール</span>
                <textarea
                placeholder="自己紹介を入力"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                />
            </label>

            <label className="edit-profile-field">
                <span>メールアドレス</span>
                <input
                type="email"
                placeholder="example@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                />
            </label>
            </section>

            <section className="edit-profile-section">
            <h2>配送先情報</h2>

            <div className="delivery-radio-list">
                <label>
                <input
                    type="radio"
                    name="deliveryPlaceType"
                    value="home_handoff"
                    checked={deliveryPlaceType === "home_handoff"}
                    onChange={(e) => setDeliveryPlaceType(e.target.value)}
                />
                自宅(手渡し)
                </label>

                <label>
                <input
                    type="radio"
                    name="deliveryPlaceType"
                    value="home_delivery_box"
                    checked={deliveryPlaceType === "home_delivery_box"}
                    onChange={(e) => setDeliveryPlaceType(e.target.value)}
                />
                自宅(置き配・宅配ボックス)
                </label>

                <label>
                <input
                    type="radio"
                    name="deliveryPlaceType"
                    value="pickup_point"
                    checked={deliveryPlaceType === "pickup_point"}
                    onChange={(e) => setDeliveryPlaceType(e.target.value)}
                />
                コンビニ・郵便局・営業所などで受取
                </label>
            </div>

            <button
                className="profile-sub-button"
                type="button"
                onClick={() => {
                setDeliveryPlaceType("");
                setPostalCode("");
                setAddressCity("");
                setAddressStreet("");
                setAddressBuilding("");
                }}
            >
                配送先を未設定に戻す
            </button>

            <div className="postal-row">
                <label className="edit-profile-field">
                <span>郵便番号</span>
                <input
                    type="text"
                    placeholder="1234567"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                />
                </label>

                <button
                className="profile-sub-button"
                type="button"
                onClick={fillAddressByPostalCode}
                >
                住所自動入力
                </button>
            </div>

            <label className="edit-profile-field">
                <span>都道府県・市区町村</span>
                <input
                type="text"
                placeholder="東京都渋谷区"
                value={addressCity}
                onChange={(e) => setAddressCity(e.target.value)}
                />
            </label>

            <label className="edit-profile-field">
                <span>町域・番地</span>
                <input
                type="text"
                placeholder="〇〇町1-2-3"
                value={addressStreet}
                onChange={(e) => setAddressStreet(e.target.value)}
                />
            </label>

            <label className="edit-profile-field">
                <span>建物名・部屋番号 / 店舗名・営業所名</span>
                <input
                type="text"
                placeholder="〇〇マンション101 / 〇〇郵便局"
                value={addressBuilding}
                onChange={(e) => setAddressBuilding(e.target.value)}
                />
            </label>

            {deliveryPlaceType && !isAddressValid && (
                <p className="edit-profile-error">
                {isPickupPoint
                    ? "最低でも受取店舗名・営業所名を入力する必要があります"
                    : "最低でも郵便番号、都道府県・市区町村、町域・番地を入力する必要があります"}
                </p>
            )}
            </section>

            <section className="edit-profile-section">
            <label className="password-toggle">
                <input
                type="checkbox"
                checked={wantSetPassword}
                onChange={(e) => setWantSetPassword(e.target.checked)}
                />
                パスワードを再設定する
            </label>

            {wantSetPassword && (
                <div className="password-fields">
                <label className="edit-profile-field">
                    <span>変更前のパスワード</span>
                    <input
                    type="password"
                    placeholder="現在のパスワード"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    />
                </label>

                <label className="edit-profile-field">
                    <span>新しいパスワード</span>
                    <input
                    type="password"
                    placeholder="新しいパスワード"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    />
                </label>

                <label className="edit-profile-field">
                    <span>新しいパスワード 確認</span>
                    <input
                    type="password"
                    placeholder="もう一度入力"
                    value={password2}
                    onChange={(e) => setPassword2(e.target.value)}
                    />
                </label>

                <Link className="profile-reset-link" to="/reset-password">
                    パスワードを忘れた場合はこちら
                </Link>
                </div>
            )}
            </section>

            <button
            className="edit-profile-submit"
            type="submit"
            disabled={!isAddressValid}
            >
            変更を確定
            </button>
        </form>

    </div>
  );
}