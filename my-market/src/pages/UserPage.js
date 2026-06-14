import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import { fireAuth } from "../firebase";

export default function UserPage(){

    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [items, setItems] = useState([]);
    const [likedItems, setLikedItems] = useState([]);

    const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

    useEffect(() => {
        const load_user = async () =>{
            try{
                const user_response = await fetch(`${REACT_APP_API_BASE_URL}/user/${id}`, { method: "GET" });
                const user_ret = await user_response.json();
                if(!user_response.ok){
                    console.error(user_ret);
                    alert("Error：" + JSON.stringify(user_ret));
                    return;
                }
                setUser(user_ret);

                const items_response = await fetch(`${REACT_APP_API_BASE_URL}/sell/${id}`, { method: "GET" });
                const items_ret = await items_response.json();
                if(!items_response.ok){
                    console.error(items_ret);
                    alert("Error：" + JSON.stringify(items_ret));
                    return;
                }
                setItems(items_ret);
            }catch(err){
                alert(err.message);
                console.error(err.message);
            }
        };
        load_user();

    }, [REACT_APP_API_BASE_URL, id]);

    useEffect(() => {
        const loadLikedItems = async () => {
            const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/likes/${id}`);

            if (!res.ok) {
                const errorText = await res.text();
                console.error(errorText);
                throw new Error("いいねした商品一覧の取得に失敗しました");
            }

            const data = await res.json();
            setLikedItems(data);
        };

        if (id) {
            loadLikedItems();
        }
    }, [id]);

    if(!user){
        return <p>Loading...</p>;
    }


    return(
        <div>
            <h1>{user.name}</h1>
            <img src={user.icon_url} alt={user.name} />
            <div>{user.bio}</div>
            <div>{fireAuth.currentUser && user.firebase_uid === fireAuth.currentUser.uid &&
            <Link to="/edit-profile">プロフィールを編集</Link>}</div>

            <h1>商品一覧</h1>
            {items ? (
            <ul>{items.map((item) => (
                <li key={item.id}>
                <Link to={`/item/${item.id}`}>
                <div><img src={item.image_url} alt={item.name} /></div>
                <div>{item.name}</div>
                <div>{item.price}</div>
                <div>{item.description}</div>
                <div>{item.seller}</div>
                <div>{item.category}</div>
                <div>{item.posted_at}</div>
                </Link>
                </li>))}</ul>
                ):(
                    <p>出品した商品はありません</p>
                )
            }

            <h1>いいねした商品</h1>
            {likedItems ? (
            <ul>{likedItems.map((item) => (
                <li key={item.id}>
                <Link to={`/item/${item.id}`}>
                <div><img src={item.image_url} alt={item.name} /></div>
                <div>{item.name}</div>
                <div>{item.price}</div>
                <div>{item.description}</div>
                <div>{item.seller}</div>
                <div>{item.category}</div>
                <div>{item.posted_at}</div>
                </Link>
                </li>))}</ul>
                ):(
                    <p>いいねした商品はありません</p>
                )
            }
        </div>
    );
}