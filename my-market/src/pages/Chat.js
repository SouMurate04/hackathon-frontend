import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fireAuth } from "../firebase";

export default function Chat() {
    const { id } = useParams();
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

    useEffect(() => {
        const loadMessages = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/chat/${id}`);

                if (!res.ok) {
                    const text = await res.text();
                    console.error(text);
                    throw new Error("チャットの取得に失敗しました");
                }

                const data = await res.json();
                setMessages(data);
            } catch (err) {
                console.error(err);
                setError(err.message);
            }
        };

        loadMessages();
    }, [API_BASE_URL, id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            if (!fireAuth.currentUser) {
                throw new Error("投稿するにはログインしてください");
            }

            if (!message.trim()) {
                throw new Error("メッセージを入力してください");
            }

            const token = await fireAuth.currentUser.getIdToken();

            const res = await fetch(`${API_BASE_URL}/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    item_id: Number(id),
                    message: message,
                }),
            });

            if (!res.ok) {
                const text = await res.text();
                console.error(text);
                throw new Error("メッセージの投稿に失敗しました");
            }

            const newMessage = await res.json();
            setMessages((prev) => [...prev, newMessage]);
            setMessage("");
        } catch (err) {
            console.error(err);
            setError(err.message);
        }
    };

    return (
        <div>
            <h1>チャット</h1>
            <Link to={`/item/${id}`}>商品ページに戻る</Link>

            <div>
                {messages.map((chat) => {
                    //const isMine = fireAuth.currentUser && chat.user_id;

                    return (
                        <div key={chat.id}>
                            <div>
                                {chat.user_icon_url && (
                                    <img
                                        src={chat.user_icon_url}
                                        alt={chat.user_name || "user"}
                                        width="32"
                                        height="32"
                                    />
                                )}
                                <strong>{chat.user_name || "ユーザー"}</strong>
                            </div>

                            <div>{chat.message}</div>
                            <small>{new Date(chat.timestamp).toLocaleString()}</small>
                        </div>
                    );
                })}
            </div>

            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="メッセージを入力"
                />
                <button type="submit">送信</button>
            </form>

            {error && <p>{error}</p>}
        </div>
    );
}