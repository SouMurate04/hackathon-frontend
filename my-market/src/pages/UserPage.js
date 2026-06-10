import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import { fireAuth } from "../firebase";

export default function UserPage(){

    const { id } = useParams();
    const [user, setUser] = useState(null);

    const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

    useEffect(() => {
        const load_user = async () =>{
            try{
                const response = await fetch(`${REACT_APP_API_BASE_URL}/user/${id}`, { method: "GET" });
                const user_ret = await response.json();
                if(!response.ok){
                    console.error(user_ret);
                    alert("Error：" + JSON.stringify(user_ret));
                    return;
                }
                setUser(user_ret);
            }catch(err){
                alert(err.message);
                console.error(err.message);
            }
        };
        load_user();

    }, [REACT_APP_API_BASE_URL, id]);

    if(!user){
        return <p>Loading...</p>;
    }


    return(
        <div>
            <h1>{user.name}</h1>
            <img src={user.image_url} alt={user.name} />
            <div>自己紹介，出品したもの(余裕あればブクマ)を追加していくぞ</div>
            <div>{fireAuth.currentUser && user.firebase_uid === fireAuth.currentUser.uid &&
            <Link to="/mypage">プロフィールを編集</Link>}</div>
        </div>
    );
}