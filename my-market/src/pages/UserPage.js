import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import { fireAuth } from "../firebase";

export default function UserPage(){

    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [items, setItems] = useState([]);
    const [likedItems, setLikedItems] = useState([]);
    const [boughtItems, setBoughtItems] = useState([]);

    const [followSummary, setFollowSummary] = useState({
        followings_count: 0,
        followers_count: 0,
    });
    const [isFollowing, setIsFollowing] = useState(false);

    const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";
    const isMyPage = fireAuth.currentUser && user?.firebase_uid === fireAuth.currentUser.uid;

    const renderItem = (item) => {
        const isSold = item.buyer_id !== null;

        return (
            <li key={item.id}>
                <Link to={`/item/${item.id}`}>
                    <div style={{ position: "relative", display: "inline-block" }}>
                        <img
                            src={item.image_url}
                            alt={item.name}
                            style={{ opacity: isSold ? 0.5 : 1 }}
                        />

                        {isSold && (
                            <div
                                style={{
                                    position: "absolute",
                                    top: "8px",
                                    left: "8px",
                                    backgroundColor: "rgba(0, 0, 0, 0.75)",
                                    color: "white",
                                    padding: "4px 8px",
                                    fontWeight: "bold",
                                }}
                            >
                                SOLD OUT
                            </div>
                        )}
                    </div>

                    <div>{item.name}</div>
                    <div>{item.price}円</div>
                    <div>{item.description}</div>
                    <div>{item.seller}</div>
                    <div>{item.c0_name}</div>
                    {item.tags && item.tags.length > 0 && (
                        <div>
                            {item.tags.map((tag, index) => (
                                <span key={`${tag}-${index}`}>#{tag} </span>
                            ))}
                        </div>
                    )}
                    <div>{item.posted_at}</div>
                </Link>
            </li>
        );
    };

    useEffect(() => {
        const load_user = async () =>{
            try{
                const user_response = await fetch(`${REACT_APP_API_BASE_URL}/user/${id}`, { method: "GET" });
                const user_ret = await user_response.json();
                if(!user_response.ok){
                    console.error(user_ret);
                    alert("Error：" + JSON.stringify(user_ret));
                    return;
                }
                setUser(user_ret);

                const items_response = await fetch(`${REACT_APP_API_BASE_URL}/sell/${id}`, { method: "GET" });
                const items_ret = await items_response.json();
                if(!items_response.ok){
                    console.error(items_ret);
                    alert("Error：" + JSON.stringify(items_ret));
                    return;
                }
                setItems(items_ret);
            }catch(err){
                alert(err.message);
                console.error(err.message);
            }
        };
        load_user();

    }, [REACT_APP_API_BASE_URL, id]);

    useEffect(() => {
        const loadLikedItems = async () => {
            const res = await fetch(`${REACT_APP_API_BASE_URL}/likes/${id}`);

            if (!res.ok) {
                const errorText = await res.text();
                console.error(errorText);
                throw new Error("いいねした商品一覧の取得に失敗しました");
            }

            const data = await res.json();
            setLikedItems(data);
        };

        if (id) {
            loadLikedItems();
        }
    }, [REACT_APP_API_BASE_URL, id]);

    useEffect(() => {
        const loadBoughtItems = async () => {
            if (!user || !fireAuth.currentUser) return;
            if (user.firebase_uid !== fireAuth.currentUser.uid) return;

            const token = await fireAuth.currentUser.getIdToken();

            const res = await fetch(`${REACT_APP_API_BASE_URL}/buy/me`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error(errorText);
                throw new Error("購入商品一覧の取得に失敗しました");
            }

            const data = await res.json();
            setBoughtItems(data);
        };

        loadBoughtItems().catch((err) => {
            console.error(err);
        });
    }, [REACT_APP_API_BASE_URL, user]);

    useEffect(() => {
        const loadFollowSummary = async () => {
            const res = await fetch(`${REACT_APP_API_BASE_URL}/follow/${id}/summary`);
            if (!res.ok) return;

            const data = await res.json();
            setFollowSummary(data);
        };

        if (id) {
            loadFollowSummary();
        }
    }, [REACT_APP_API_BASE_URL, id]);

    useEffect(() => {
        const loadFollowStatus = async () => {
            if (!user || !fireAuth.currentUser) return;
            if (user.firebase_uid === fireAuth.currentUser.uid) return;

            const token = await fireAuth.currentUser.getIdToken();

            const res = await fetch(`${REACT_APP_API_BASE_URL}/follow/${id}/status`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) return;

            const data = await res.json();
            setIsFollowing(data.is_following);
        };

        loadFollowStatus();
    }, [REACT_APP_API_BASE_URL, id, user]);

    const handleFollow = async () => {
        if (!fireAuth.currentUser) {
            alert("フォローするにはログインしてください");
            return;
        }

        const token = await fireAuth.currentUser.getIdToken();

        const res = await fetch(`${REACT_APP_API_BASE_URL}/follow/${id}`, {
            method: isFollowing ? "DELETE" : "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!res.ok) {
            alert("フォロー状態の更新に失敗しました");
            return;
        }

        const data = await res.json();
        setIsFollowing(data.is_following);

        setFollowSummary((prev) => ({
            ...prev,
            followers_count: prev.followers_count + (data.is_following ? 1 : -1),
        }));
    };

    if(!user){
        return <p>Loading...</p>;
    }


    return(
        <div>
            <h1>{user.name}</h1>
            <img src={user.icon_url} alt={user.name} />
            <div>{user.bio}</div>
            <div>{isMyPage && <Link to="/edit-profile">プロフィールを編集</Link>}</div>

            <div>
                <Link to={`/user/${id}/followings`}>
                    フォロー {followSummary.followings_count}
                </Link>
                {" / "}
                <Link to={`/user/${id}/followers`}>
                    フォロワー {followSummary.followers_count}
                </Link>
            </div>

            {fireAuth.currentUser && user.firebase_uid !== fireAuth.currentUser.uid && (
                <button type="button" onClick={handleFollow}>
                    {isFollowing ? "フォロー解除" : "フォローする"}
                </button>
            )}

            <h1>商品一覧</h1>
            {items ? (
            <ul>{items.map(renderItem)}</ul>
                ):(
                    <p>出品した商品はありません</p>
                )
            }

            {isMyPage && (
            <>
            <h1>購入した商品</h1>

            {boughtItems.length > 0 ? (
                <ul>{boughtItems.map(renderItem)}</ul>
            ) : (
                <p>購入した商品はありません</p>
            )}
            </>
            )}

            <h1>いいねした商品</h1>
            {likedItems ? (
            <ul>{likedItems.map(renderItem)}</ul>
                ):(
                    <p>いいねした商品はありません</p>
                )
            }
        </div>
    );
}