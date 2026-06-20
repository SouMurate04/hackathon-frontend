import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fireAuth } from "../firebase";

export default function Subscription() {
    const [items, setItems] = useState([]);

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

    useEffect(() => {
        const loadItems = async () => {
            const token = await fireAuth.currentUser.getIdToken();

            const res = await fetch(`${API_BASE_URL}/browse/subscription`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) return;

            const data = await res.json();
            setItems(data);
        };

        loadItems();
    }, [API_BASE_URL]);

    document.title = "仲間の様子 | WhatsOnSale";

    return (
    <div className="subscription-page">
        <div className="subscription-header">
        <h1>Meet Your Friends!</h1>
        <p>フォローしているユーザーが出品中の商品です。</p>
        </div>

        {items.length === 0 ? (
        <p className="subscription-empty">
            フォロー中ユーザーの出品はありません
        </p>
        ) : (
        <ul className="item-grid">
            {items.map((item) => (
            <li key={item.id} className="item-card">
                <Link to={`/item/${item.id}`} className="item-card-link">
                <div className="item-image-wrap">
                    <img
                    className="item-image"
                    src={item.image_url}
                    alt={item.name}
                    />
                </div>

                <div className="item-title">{item.name}</div>
                <div className="item-price">{item.price}円</div>
                <div className="item-meta">出品者: {item.seller}</div>
                <div className="item-meta">
                    {item.c0_name} / {item.c1_name}
                </div>

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
        )}
    </div>
    );
}