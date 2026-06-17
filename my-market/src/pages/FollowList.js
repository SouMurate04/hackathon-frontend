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

    return (
        <div>
            <h1>{isFollowers ? "フォロワー" : "フォロー中"}</h1>

            <ul>
                {users.map((user) => (
                    <li key={user.id}>
                        <Link to={`/user/${user.id}`}>
                            {user.icon_url && (
                                <img src={user.icon_url} alt={user.name || "user"} />
                            )}
                            <div>{user.name}</div>
                            <div>{user.bio}</div>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}