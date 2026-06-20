import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

export default function FollowList({ type }) {
    const { id } = useParams();
    const [users, setUsers] = useState([]);

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";
    const isFollowers = type === "followers";

    useEffect(() => {
        const loadUsers = async () => {
            const path = isFollowers ? "followers" : "followings";
            const res = await fetch(`${API_BASE_URL}/follow/${id}/${path}`);

            if (!res.ok) return;

            const data = await res.json();
            setUsers(data);
        };

        loadUsers();
    }, [API_BASE_URL, id, isFollowers]);

    document.title = isFollowers ? "フォロワー | WhatsOnSale" : "フォロー中 | WhatsOnSale";

    return (
    <div className="follow-list-page">
        <h1 className="follow-list-title">
        {isFollowers ? "フォロワー" : "フォロー中"}
        </h1>

        {users.length === 0 ? (
        <p className="follow-list-empty">
            {isFollowers ? "フォロワーはいません" : "フォロー中のユーザーはいません"}
        </p>
        ) : (
        <ul className="follow-user-grid">
            {users.map((user) => (
            <li key={user.id} className="follow-user-card">
                <Link to={`/user/${user.id}`} className="follow-user-link">
                <img
                    className="follow-user-icon"
                    src={user.icon_url}
                    alt={user.name || "user"}
                />

                <div className="follow-user-name">
                    {user.name || "ユーザー"}
                </div>

                <p className="follow-user-bio">
                    {user.bio || "自己紹介はまだありません"}
                </p>
                </Link>
            </li>
            ))}
        </ul>
        )}
    </div>
    );
}