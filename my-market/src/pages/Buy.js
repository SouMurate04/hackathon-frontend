import { useEffect , useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { fireAuth } from "../firebase";

export default function Buy(){

    const { id } = useParams();
    const [item, setItem] = useState(null);
    const [deliveryPlaceType, setDeliveryPlaceType] = useState("");
    const [postalCode, setPostalCode] = useState("");
    const [addressCity, setAddressCity] = useState("");
    const [addressStreet, setAddressStreet] = useState("");
    const [addressBuilding, setAddressBuilding] = useState("");
    const [saveAsDefault, setSaveAsDefault] = useState(false);
    const [messageToSeller, setMessageToSeller] = useState("");
    const navigate = useNavigate();

    const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

    useEffect(() => {
        const load_item = async () => {
            try{
                const response = await fetch(`${REACT_APP_API_BASE_URL}/browse/${id}`,
                {
                    method: "GET",
                });
                const item_ret = await response.json();
                if (!response.ok) {
                    console.error(item_ret);
                    alert("Error：" + JSON.stringify(item_ret));
                    return;
                }
                setItem(item_ret);
            }catch(err){
                console.error(err.message);
                alert(err.message);
            }
        };
        load_item();
    
    }, [REACT_APP_API_BASE_URL, id]);

    useEffect(() => {
        const loadUser = async () => {
            if (!fireAuth.currentUser) return;

            const token = await fireAuth.currentUser.getIdToken();

            const res = await fetch(`${REACT_APP_API_BASE_URL}/user/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) return;

            const user = await res.json();

            setDeliveryPlaceType(user.delivery_place_type || "");
            setPostalCode(user.postal_code || "");
            setAddressCity(user.address_city || "");
            setAddressStreet(user.address_street || "");
            setAddressBuilding(user.address_building || "");
        };

        loadUser();
    }, [REACT_APP_API_BASE_URL]);

    const fillAddressByPostalCode = async () => {
        try {
            const code = postalCode.replace("-", "");

            if (!code) {
                throw new Error("郵便番号を入力してください");
            }

            const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${code}`);
            const data = await res.json();

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

    const isHomeDelivery =
        deliveryPlaceType === "home_handoff" ||
        deliveryPlaceType === "home_delivery_box";

    const isPickupPoint = deliveryPlaceType === "pickup_point";

    const isAddressValid =
        (isHomeDelivery && postalCode && addressCity && addressStreet) ||
        (isPickupPoint && postalCode && addressCity && addressBuilding);

    const handleBuy = async (e) => {
        e.preventDefault();

        try {
            if (!isAddressValid) {
                throw new Error("配送先情報が不足しています");
            }

            const token = await fireAuth.currentUser.getIdToken();

            const response = await fetch(`${REACT_APP_API_BASE_URL}/buy/${id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    delivery_place_type: deliveryPlaceType,
                    postal_code: postalCode,
                    address_city: addressCity,
                    address_street: addressStreet,
                    address_building: addressBuilding,
                    save_as_default: saveAsDefault,
                    message_to_seller: messageToSeller,
                }),
            });

            if (!response.ok) {
                const text = await response.text();
                console.error(text);
                throw new Error("購入に失敗しました");
            }

            alert("購入に成功しました");
            navigate("/");
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };

    if (!item) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            <h1>購入確認</h1>

            <h2>{item.name}</h2>
            <img src={item.image_url} alt={item.name} />
            <p>{item.price}円</p>
            <p>出品者: {item.seller}</p>

            {item.buyer_id ? (
                <p>この商品は購入済みです</p>
            ) : (
                <form onSubmit={handleBuy}>
                    <h2>配送先</h2>

                    <div>
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

                    <div>
                        <label>
                            郵便番号
                            <input
                                type="text"
                                value={postalCode}
                                onChange={(e) => setPostalCode(e.target.value)}
                                placeholder="1234567"
                            />
                        </label>

                        <button type="button" onClick={fillAddressByPostalCode}>
                            郵便番号から住所入力
                        </button>
                    </div>

                    <div>
                        <label>
                            都道府県・市区町村
                            <input
                                type="text"
                                value={addressCity}
                                onChange={(e) => setAddressCity(e.target.value)}
                                placeholder="東京都渋谷区"
                            />
                        </label>
                    </div>

                    <div>
                        <label>
                            町域・番地
                            <input
                                type="text"
                                value={addressStreet}
                                onChange={(e) => setAddressStreet(e.target.value)}
                                placeholder="〇〇町1-2-3"
                            />
                        </label>
                    </div>

                    <div>
                        <label>
                            建物名・部屋番号 / 店舗名・営業所名
                            <input
                                type="text"
                                value={addressBuilding}
                                onChange={(e) => setAddressBuilding(e.target.value)}
                                placeholder="〇〇マンション101 / 〇〇郵便局"
                            />
                        </label>
                    </div>

                    <div>
                        <label>
                            <input
                                type="checkbox"
                                checked={saveAsDefault}
                                onChange={(e) => setSaveAsDefault(e.target.checked)}
                            />
                            この配送先をデフォルトにする
                        </label>
                    </div>

                    <h2>出品者へのメッセージ</h2>

                    <textarea
                        value={messageToSeller}
                        onChange={(e) => setMessageToSeller(e.target.value)}
                        placeholder="例: 購入させていただきます。よろしくお願いします。"
                    />

                    {error && <p>{error}</p>}

                    <button type="submit" disabled={!isAddressValid}>
                        購入確定
                    </button>
                </form>
            )}
        </div>
    );
}