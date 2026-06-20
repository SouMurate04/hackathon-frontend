import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fireAuth } from "../firebase";

export default function NotificationAll() {
    const [notifications, setNotifications] = useState([]);
    const [error, setError] = useState("");

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

    useEffect(() => {
        const loadNotifications = async () => {
            const token = await fireAuth.currentUser.getIdToken();

            const res = await fetch(`${API_BASE_URL}/notification`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                throw new Error("通知の取得に失敗しました");
            }

            const data = await res.json();
            setNotifications(data);
        };

        loadNotifications().catch((err) => {
            console.error(err);
            setError(err.message);
        });
    }, [API_BASE_URL]);

    document.title = "通知一覧 | WhatsOnSale";

    return (
    <div className="notification-page">
        <h1 className="notification-title">通知</h1>

        {error && <p className="notification-error">{error}</p>}

        {notifications.length === 0 ? (
        <p className="notification-empty">通知はありません</p>
        ) : (
        <ul className="notification-list">
            {notifications.map((notification) => (
            <li key={notification.id} className="notification-list-item">
                <Link
                to={`/notification/${notification.id}`}
                className="notification-link"
                >
                <div className="notification-left">
                    {!notification.is_read && (
                    <span className="notification-unread-badge">未読</span>
                    )}
                    <span className="notification-list-title">
                    {notification.title}
                    </span>
                </div>

                <time className="notification-time">
                    {new Date(notification.timestamp).toLocaleString()}
                </time>
                </Link>
            </li>
            ))}
        </ul>
        )}
    </div>
    );
}