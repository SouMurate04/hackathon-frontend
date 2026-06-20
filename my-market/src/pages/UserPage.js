import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import { fireAuth } from "../firebase";

export default function UserPage(){

    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState("listed");
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
            <li key={item.id} className="item-card">
                <Link to={`/item/${item.id}`} className="item-card-link">
                    <div className="item-image-wrap">
                        <img
                            className="item-image"
                            src={item.image_url}
                            alt={item.name}
                            style={{ opacity: isSold ? 0.5 : 1 }}
                        />

                        {isSold && (
                            <div className="sold-badge">
                                SOLD
                            </div>
                        )}
                    </div>

                    <div className="item-title">{item.name}</div>
                    <div className="item-price">{item.price}円</div>
                    <div className="item-meta">{item.seller}</div>
                    <div className="item-meta">{item.c0_name} / {item.c1_name}</div>

                    {item.tags && item.tags.length > 0 && (
                    <div className="item-tags">
                        {item.tags.slice(0, 4).map((tag, index) => (
                        <span className="item-tag" key={`${tag}-${index}`}>
                            #{tag}
                        </span>
                        ))}
                        {item.tags.length > 4 && (
                        <span className="item-tag">...</span>
                        )}
                    </div>
                    )}

                    <div className="item-meta">{item.posted_at}</div>
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

    const tabs = [
        {
            key: "listed",
            label: "出品商品",
            items: items,
            emptyText: "出品した商品はありません",
        },
        ...(isMyPage
            ? [
                {
                    key: "bought",
                    label: "購入商品",
                    items: boughtItems,
                    emptyText: "購入した商品はありません",
                },
            ]
            : []),
        {
            key: "liked",
            label: "いいね",
            items: likedItems,
            emptyText: "いいねした商品はありません",
        },
    ];

    const activeTabData = tabs.find((tab) => tab.key === activeTab) || tabs[0];
    
    useEffect(() => {
        setActiveTab("listed");
    }, [id]);

    if(!user){
        return <p>Loading...</p>;
    }

    document.title = `${user.name}さん | WhatsOnSale`;

    return(
        <div>
            <section className="user-profile">
                <div className="user-profile-icon-wrap">
                    <img
                        src={user.icon_url}
                        alt={user.name}
                        className="user-profile-icon"
                    />
                </div>

                <div className="user-profile-body">
                    <div className="user-profile-header">
                        <h1 className="user-profile-name">{user.name}</h1>

                        {isMyPage && (
                            <Link to="/edit-profile" className="profile-edit-link">
                                登録情報を編集
                            </Link>
                        )}

                        {fireAuth.currentUser && user.firebase_uid !== fireAuth.currentUser.uid && (
                            <button
                                type="button"
                                onClick={handleFollow}
                                className="profile-follow-button"
                            >
                                {isFollowing ? "フォロー解除" : "フォローする"}
                            </button>
                        )}
                    </div>

                    <div className="user-follow-row">
                        <Link to={`/user/${id}/followings`} className="user-follow-link">
                            <span>{followSummary.followings_count}</span>
                            フォロー
                        </Link>

                        <Link to={`/user/${id}/followers`} className="user-follow-link">
                            <span>{followSummary.followers_count}</span>
                            フォロワー
                        </Link>
                    </div>

                    <p className="user-profile-bio">
                        {user.bio || "自己紹介はまだありません"}
                    </p>
                </div>
            </section>

            <section className="user-items-section">
                <div className="user-tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            className={`user-tab-button ${activeTab === tab.key ? "active" : ""}`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTabData.items.length > 0 ? (
                    <ul className="item-grid">
                        {activeTabData.items.map(renderItem)}
                    </ul>
                ) : (
                    <p className="user-tab-empty">
                        {activeTabData.emptyText}
                    </p>
                )}
            </section>
        </div>
    );
}