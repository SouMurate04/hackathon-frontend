import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fireAuth } from "../firebase";

export default function Notification() {
    const { notification_id } = useParams();
    const [notification, setNotification] = useState(null);
    const [replyMessage, setReplyMessage] = useState("");
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

    const handleReply = async () => {
        try {
            setError("");

            if (!replyMessage.trim()) {
                throw new Error("返信メッセージを入力してください");
            }

            const token = await fireAuth.currentUser.getIdToken();

            const res = await fetch(`${API_BASE_URL}/notification/${notification_id}/reply`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    message: replyMessage,
                }),
            });

            if (!res.ok) {
                const text = await res.text();
                console.error(text);
                throw new Error("返信の送信に失敗しました");
            }

            setNotification((prev) => ({
                ...prev,
                is_read: true,
                responded_at: new Date().toISOString(),
            }));

            setReplyMessage("");
            alert("返信を送信しました");
        } catch (err) {
            console.error(err);
            setError(err.message);
        }
    };

    const handleDismiss = async () => {
        try {
            setError("");

            const token = await fireAuth.currentUser.getIdToken();

            const res = await fetch(`${API_BASE_URL}/notification/${notification_id}/dismiss`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                const text = await res.text();
                console.error(text);
                throw new Error("通知の処理に失敗しました");
            }

            setNotification((prev) => ({
                ...prev,
                is_read: true,
                responded_at: new Date().toISOString(),
            }));

            alert("通知を既読にしました");
        } catch (err) {
            console.error(err);
            setError(err.message);
        }
    };

    if (error) return <p>{error}</p>;
    if (!notification) return <p>Loading...</p>;

    return (
        <div>
            <h1>{notification.title}</h1>
            <p>{notification.message}</p>
            <p>{new Date(notification.timestamp).toLocaleString()}</p>

            {notification.requires_action && !notification.responded_at && (
                <div>
                    <textarea
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="購入者へのメッセージ"
                    />

                    <button type="button" onClick={handleReply}>
                        送信
                    </button>

                    <button type="button" onClick={handleDismiss}>
                        メッセージは送信しない
                    </button>
                </div>
            )}

            {notification.item_id && (
                <Link to={`/item/${notification.item_id}`}>
                    商品ページを見る
                </Link>
            )}
        </div>
    );
}