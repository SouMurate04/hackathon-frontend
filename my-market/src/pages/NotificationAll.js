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

    return (
        <div>
            <h1>通知</h1>

            {error && <p>{error}</p>}

            <ul>
                {notifications.map((notification) => (
                    <li key={notification.id}>
                        <Link to={`/notification/${notification.id}`}>
                            {!notification.is_read && <strong>未読 </strong>}
                            <span>{notification.title}</span>
                            <div>{new Date(notification.timestamp).toLocaleString()}</div>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}