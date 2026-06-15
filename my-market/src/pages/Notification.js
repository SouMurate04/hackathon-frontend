import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fireAuth } from "../firebase";

export default function Notification() {
    const { notification_id } = useParams();
    const [notification, setNotification] = useState(null);
    const [error, setError] = useState("");

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

    useEffect(() => {
        const loadNotification = async () => {
            const token = await fireAuth.currentUser.getIdToken();

            const res = await fetch(`${API_BASE_URL}/notification/${notification_id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                throw new Error("通知の取得に失敗しました");
            }

            const data = await res.json();
            setNotification(data);
        };

        loadNotification().catch((err) => {
            console.error(err);
            setError(err.message);
        });
    }, [API_BASE_URL, notification_id]);

    if (error) return <p>{error}</p>;
    if (!notification) return <p>Loading...</p>;

    return (
        <div>
            <h1>{notification.title}</h1>
            <p>{notification.message}</p>
            <p>{new Date(notification.timestamp).toLocaleString()}</p>

            {notification.item_id && (
                <Link to={`/item/${notification.item_id}`}>
                    商品ページを見る
                </Link>
            )}
        </div>
    );
}