import { useEffect , useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fireAuth } from "../firebase";
import chatIcon from "../images/Chat.png";
import likeIcon from "../images/Like.png";

export default function ItemPage(){

    const { id } = useParams();
    const [item, setItem] = useState(null);
    const [liked, setLiked] = useState(false);
    const [recommendedItems, setRecommendedItems] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

    useEffect(() => {
        setSelectedImageIndex(0);
    }, [id]);

    useEffect(() => {
        const load_item = async () => {
            try{
                const response = await fetch(`${REACT_APP_API_BASE_URL}/browse/${id}`, { method: "GET" });
                const item_ret = await response.json();
                if (!response.ok) {
                    console.error(item_ret);
                    alert("Error：" + JSON.stringify(item_ret));
                    return;
                }
                setItem(item_ret);

                if (fireAuth.currentUser) {
                    const token = await fireAuth.currentUser.getIdToken();
                    const likeResponse = await fetch(`${REACT_APP_API_BASE_URL}/like/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const likeRet = await likeResponse.json();

                if (likeResponse.ok) {
                    setLiked(likeRet.liked);
                }
            }
            }catch(err){
                alert(err.message);
                console.error(err.message);
            }
        };
        load_item();
    
    }, [REACT_APP_API_BASE_URL, id]);

    useEffect(() => {
        const loadRecommendedItems = async () => {
            try {
                const res = await fetch(
                    `${REACT_APP_API_BASE_URL}/browse/${id}/recommendations?limit=4`
                );

            if (!res.ok) {
                throw new Error("おすすめ商品の取得に失敗しました");
            }

            const data = await res.json();
            setRecommendedItems(data);
            } catch (err) {
                console.error(err);
            }
        };

        if (id) {
            loadRecommendedItems();
        }
    }, [REACT_APP_API_BASE_URL, id]);

    useEffect(() => {
        const loadCurrentUser = async () => {
            if (!fireAuth.currentUser) return;

            const token = await fireAuth.currentUser.getIdToken();

            const res = await fetch(`${REACT_APP_API_BASE_URL}/user/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                const data = await res.json();
                setCurrentUser(data);
            }
        };

        loadCurrentUser();
    }, [REACT_APP_API_BASE_URL]);

    const handleLike = async () => {
        if (!fireAuth.currentUser) {
            alert("いいねするにはログインしてください");
            return;
        }

        const token = await fireAuth.currentUser.getIdToken();

        const response = await fetch(`${REACT_APP_API_BASE_URL}/like/${id}`, {
            method: liked ? "DELETE" : "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            alert("いいねの更新に失敗しました");
            console.error(data);
            return;
        }

        setLiked(data.liked);
    };

    if (!item) {
        return <p>Loading...</p>;
    }

    const imageUrls =
        item.image_urls && item.image_urls.length > 0
            ? item.image_urls
            : item.image_url
                ? [item.image_url]
                : [];

    const selectedImage = imageUrls[selectedImageIndex] || imageUrls[0];

    const isSeller = currentUser && item.seller_id === currentUser.id;

    document.title = `${item.name} | WhatsOnSale`;

    return(
        <div className="item-detail-page">
            <section className="item-detail-main">
                <div className="item-detail-images">
                    <div className="item-detail-main-image-wrap">
                        {selectedImage ? (
                            <img
                                className="item-detail-main-image"
                                src={selectedImage}
                                alt={item.name}
                            />
                        ) : (
                            <div className="item-detail-no-image">No Image</div>
                        )}
                    </div>

                    {imageUrls.length > 1 && (
                        <ul className="item-detail-thumbnails">
                            {imageUrls.map((url, index) => (
                                <li key={`${url}-${index}`} className="item-detail-thumbnail-item">
                                <button
                                type="button"
                                className={`item-detail-thumbnail-button ${
                                    selectedImageIndex === index ? "active" : ""
                                }`}
                                onClick={() => setSelectedImageIndex(index)}
                                >
                                    <img
                                        className="item-detail-thumbnail-image"
                                        src={url}
                                        alt={`${item.name}-${index + 1}`}
                                    />
                                </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="item-detail-info">
                    <h1 className="item-detail-title">{item.name}</h1>

                    <p className="item-detail-meta">
                        出品者:{" "}
                        <Link className="item-detail-link" to={`/user/${item.seller_id}`}>
                        {item.seller}
                        </Link>
                    </p>

                    <p className="item-detail-price">{item.price}円</p>

                    <div className="item-detail-block">
                        <h2>説明</h2>
                        <p>{item.description}</p>
                    </div>

                    <p className="item-detail-meta">
                        カテゴリ: {item.c0_name} / {item.c1_name}
                    </p>

                    {item.tags && item.tags.length > 0 && (
                        <div className="item-tags item-detail-tags">
                            {item.tags.map((tag, index) => (
                                <Link
                                className="item-tag"
                                key={`${tag}-${index}`}
                                to={`/browse?keyword=${encodeURIComponent(`#${tag}`)}`}
                                >
                                    #{tag}
                                </Link>
                            ))}
                        </div>
                    )}

                    <div className="item-detail-actions">
                        <Link className="item-action-button chat" to={`/item/${id}/chat`}>
                            <img className="item-action-icon" src={chatIcon} alt="" />
                            交渉に行く
                        </Link>

                        <button
                        className={`item-action-button like ${liked ? "liked" : ""}`}
                        type="button"
                        onClick={handleLike}
                        >
                            {!liked && (
                                <img className="item-action-icon" src={likeIcon} alt="" />
                            )}
                            {liked ? "いいね済み" : "いいね"}
                        </button>

                        {item.buyer_id ? (
                            <p className="item-sold-message">この商品は売却済みです</p>
                        ) : isSeller ? (
                            <Link className="item-action-button primary" to={`/item/${id}/edit`}>
                                商品情報を編集
                            </Link>
                        ) : (
                            <Link className="item-action-button primary" to={`/item/${id}/buy`}>
                                購入する
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            <h2>関連商品</h2>

            {recommendedItems.length > 0 ? (
            <ul className="item-grid">
                {recommendedItems.map((item) => (
                <li key={item.id} className="item-card">
                    <Link to={`/item/${item.id}`} className="item-card-link">
                    <div className="item-image-wrap">
                        <img className="item-image" src={item.image_url} alt={item.name} />
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
                ))}
            </ul>
            ) : (
            <p>関連商品はまだありません</p>
            )}
        </div>
    );
}
