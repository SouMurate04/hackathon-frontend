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

    return (
        <div>
            <h1>フォロー中ユーザーの出品</h1>

            {items.length === 0 ? (
                <p>フォロー中ユーザーの出品はありません</p>
            ) : (
                <ul>
                    {items.map((item) => (
                        <li key={item.id}>
                            <Link to={`/item/${item.id}`}>
                                <img src={item.image_url} alt={item.name} />
                                <div>{item.name}</div>
                                <div>{item.price}円</div>
                                <div>{item.seller}</div>
                                <div>{item.c0_name} / {item.c1_name}</div>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}