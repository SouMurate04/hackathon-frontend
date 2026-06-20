import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fireAuth } from "../firebase";

export default function Chat() {
    const { id } = useParams();
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [currentUser, setCurrentUser] = useState(null);
    const [item, setItem] = useState(null);
    const messagesEndRef = useRef(null);

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
                alert(err.message);
            }
        };

        loadMessages();
    }, [API_BASE_URL, id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();

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
            alert(err.message);
        }
    };

    useEffect(() => {
    const loadPageData = async () => {
        try {
        const itemRes = await fetch(`${API_BASE_URL}/browse/${id}`);
        if (itemRes.ok) {
            setItem(await itemRes.json());
        }

        if (fireAuth.currentUser) {
            const token = await fireAuth.currentUser.getIdToken();
            const userRes = await fetch(`${API_BASE_URL}/user/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            });

            if (userRes.ok) {
            setCurrentUser(await userRes.json());
            }
        }
        } catch (err) {
        console.error(err);
        alert(err.message)
        }
    };

    loadPageData();
    }, [API_BASE_URL, id]);

    if(!item){
        return (<p>loading...</p>)
    }

    document.title = `交渉 | ${item.name} | WhatsOnSale`;

    return (
    <div className="chat-page">
        <Link className="chat-back-link" to={`/item/${id}`}>
        ← 商品ページに戻る
        </Link>

        <div className="chat-header">
        <h1>Let's talk about the item!!</h1>
        {item && <p>{item.name}</p>}
        </div>

        <div className="chat-messages">
        {messages.map((chat) => {
            const isMine = currentUser && chat.user_id === currentUser.id;
            const isSeller = item && chat.user_id === item.seller_id;

            return (
            <div
                key={chat.id}
                className={`chat-message ${isMine ? "mine" : "other"} ${
                isSeller ? "seller" : ""
                }`}
            >
                <img
                className="chat-user-icon"
                src={chat.user_icon_url}
                alt={chat.user_name || "user"}
                />

                <div className="chat-bubble-wrap">
                <div className="chat-user-row">
                    <span className="chat-user-name">
                    {chat.user_name || "ユーザー"}
                    </span>
                    {isSeller && <span className="chat-seller-badge">出品者</span>}
                </div>

                <div className="chat-bubble">{chat.message}</div>

                <time className="chat-time">
                    {new Date(chat.timestamp).toLocaleString()}
                </time>
                </div>
            </div>
            );
        })}
        <div ref={messagesEndRef} />
        </div>

        <form className="chat-form" onSubmit={handleSubmit}>
        <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="メッセージを入力"
        />
        <button type="submit">送信</button>
        </form>

    </div>
    );
}
