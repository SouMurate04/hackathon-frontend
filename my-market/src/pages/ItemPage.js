import { useEffect , useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fireAuth } from "../firebase";

export default function ItemPage(){

    const { id } = useParams();
    const [item, setItem] = useState(null);
    const [liked, setLiked] = useState(false);
    const [recommendedItems, setRecommendedItems] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);

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

    useEffect(() => {
        const loadRecommendedItems = async () => {
            try {
                const res = await fetch(
                    `${REACT_APP_API_BASE_URL}/browse/${id}/recommendations?limit=4`
                );

            if (!res.ok) {
                throw new Error("おすすめ商品の取得に失敗しました");
            }

            const data = await res.json();
            setRecommendedItems(data);
            } catch (err) {
                console.error(err);
            }
        };

        if (id) {
            loadRecommendedItems();
        }
    }, [REACT_APP_API_BASE_URL, id]);

    useEffect(() => {
        const loadCurrentUser = async () => {
            if (!fireAuth.currentUser) return;

            const token = await fireAuth.currentUser.getIdToken();

            const res = await fetch(`${REACT_APP_API_BASE_URL}/user/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                const data = await res.json();
                setCurrentUser(data);
            }
        };

        loadCurrentUser();
    }, [REACT_APP_API_BASE_URL]);

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
            {item.tags && item.tags.length > 0 && (
                <div>
                    {item.tags.map((tag, index) => (
                        <Link
                            key={`${tag}-${index}`}
                            to={`/browse?keyword=${encodeURIComponent(`#${tag}`)}`}
                        >
                            #{tag}{" "}
                        </Link>
                    ))}
                </div>
            )}
            <Link to={`/item/${id}/chat`}>チャットを見る</Link>
            <button type="button" onClick={handleLike}>
                {liked ? "いいね済み" : "いいね"}
            </button>
            <div>{!item.buyer_id ?(
            <Link to={`/item/${id}/buy`}>購入する</Link>
            ):(
            <p>この商品は購入済みです</p>
            )}</div>
            <>
            {currentUser && item.seller_id === currentUser.id && !item.buyer_id && (
                <Link to={`/item/${id}/edit`}>商品情報を編集</Link>
            )}
            </>

            <h2>関連商品</h2>

            {recommendedItems.length > 0 ? (
                <ul>
                    {recommendedItems.map((item) => (
                    <li key={item.id}>
                        <Link to={`/item/${item.id}`}>
                        <img src={item.image_url} alt={item.name} />
                        <div>{item.name}</div>
                        <div>{item.price}円</div>
                        <div>{item.c0_name} / {item.c1_name}</div>
                        </Link>
                    </li>
                    ))}
                </ul>
                ) : (
                <p>関連商品はまだありません</p>
            )}
        </div>
    );
}