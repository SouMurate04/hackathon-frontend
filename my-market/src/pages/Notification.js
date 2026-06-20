import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fireAuth } from "../firebase";

export default function Notification() {
    const { notification_id } = useParams();
    const [notification, setNotification] = useState(null);
    const [replyMessage, setReplyMessage] = useState("");

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
            alert(err.message);
        });
    }, [API_BASE_URL, notification_id]);

    const handleReply = async () => {
        try {

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
            alert(err.message);
        }
    };

    const handleDismiss = async () => {
        try {

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
            alert(err.message);
        }
    };

    if (!notification) return <p>Loading...</p>;

    return (
    <div className="notification-detail-page">
        <article className="notification-detail-card">
        <header className="notification-detail-header">
            <h1>{notification.title}</h1>

            {!notification.is_read && (
            <span className="notification-unread-badge">未読</span>
            )}
        </header>

        <p className="notification-detail-message">
            {notification.message}
        </p>

        {notification.requires_action && !notification.responded_at && (
            <section className="notification-reply-box">
            <h2>購入者へメッセージを送る</h2>

            <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="例: ご購入ありがとうございます。発送準備ができ次第ご連絡します。"
            />

            <div className="notification-reply-actions">
                <button
                className="notification-reply-button primary"
                type="button"
                onClick={handleReply}
                >
                送信
                </button>

                <button
                className="notification-reply-button secondary"
                type="button"
                onClick={handleDismiss}
                >
                メッセージは送信しない
                </button>
            </div>
            </section>
        )}

        {notification.item_id && (
            <Link
            className="notification-item-button"
            to={`/item/${notification.item_id}`}
            >
            商品ページを見る
            </Link>
        )}

        <time className="notification-detail-time">
            {new Date(notification.timestamp).toLocaleString()}
        </time>
        </article>
    </div>
    );
}