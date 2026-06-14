import { useEffect , useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fireAuth } from "../firebase";

export default function ItemPage(){

    const { id } = useParams();
    const [item, setItem] = useState(null);
    const [liked, setLiked] = useState(false);

    const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

    useEffect(() => {
        const load_item = async () => {
            try{
                const response = await fetch(`${REACT_APP_API_BASE_URL}/browse/${id}`, { method: "GET" });
                const item_ret = await response.json();
                if (!response.ok) {
                    console.error(item_ret);
                    alert("Error：" + JSON.stringify(item_ret));
                    return;
                }
                setItem(item_ret);

                if (fireAuth.currentUser) {
                    const token = await fireAuth.currentUser.getIdToken();
                    const likeResponse = await fetch(`${REACT_APP_API_BASE_URL}/like/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const likeRet = await likeResponse.json();

                if (likeResponse.ok) {
                    setLiked(likeRet.liked);
                }
            }
            }catch(err){
                alert(err.message);
                console.error(err.message);
            }
        };
        load_item();
    
    }, [REACT_APP_API_BASE_URL, id]);

    const handleLike = async () => {
        if (!fireAuth.currentUser) {
            alert("いいねするにはログインしてください");
            return;
        }

        const token = await fireAuth.currentUser.getIdToken();

        const response = await fetch(`${REACT_APP_API_BASE_URL}/like/${id}`, {
            method: liked ? "DELETE" : "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            alert("いいねの更新に失敗しました");
            console.error(data);
            return;
        }

        setLiked(data.liked);
    };

    if (!item) {
        return <p>Loading...</p>;
    }

    return(
        <div>
            <h1>{item.name}</h1>
            <img src={item.image_url} alt={item.name} />
            <p>{item.price}円</p>
            <p>{item.description}</p>
            <p>出品者: {item.seller}</p>
            <p>カテゴリ: {item.c0_name} / {item.c1_name}</p>
            <button type="button" onClick={handleLike}>
                {liked ? "いいね済み" : "いいね"}
            </button>
            <div>{!item.buyer_id ?(
            <Link to={`/item/${id}/buy`}>購入する</Link>
            ):(
            <p>この商品は購入済みです</p>
            )}</div>
        </div>
    );
}