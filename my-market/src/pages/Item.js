import { useEffect , useState } from "react";
import { useParams } from "react-router-dom";

export default function Item(){

    const { id } = useParams();
    const [item, setItem] = useState(null);
    const [error, setError] = useState(null);

    const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

    useEffect(() => {
        const load_item = async () => {
            try{
                const response = await fetch(`${REACT_APP_API_BASE_URL}/browse/${id}`,
                {
                    method: "GET",
                });
                const item_ret = await response.json();
                if (!response.ok) {
                    console.error(item_ret);
                    alert("Error：" + JSON.stringify(item_ret));
                    return;
                }
                setItem(item_ret);
            }catch(err){
                setError(err.message);
                console.error(err.message);
            }
        };
        load_item();
    
    }, [REACT_APP_API_BASE_URL, id]);

    if (error) {
        return <p>{error}</p>;
    }

    if (!item) {
        return <p>読み込み中...</p>;
    }

    return(
        <div>
            <h1>{item.name}</h1>
            <img src={item.image_url} alt={item.name} />
            <p>{item.price}円</p>
            <p>{item.description}</p>
            <p>出品者: {item.seller}</p>
            <p>カテゴリ: {item.category}</p>
        </div>
    );
}