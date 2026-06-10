import { useEffect , useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { fireAuth } from "../firebase";

export default function Buy(){

    const { id } = useParams();
    const [item, setItem] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

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

    const handleBuy = async (e) => {
        e.preventDefault();
        setError("");
        
        try{
            const token = await fireAuth.currentUser.getIdToken();
            const response = await fetch(`${REACT_APP_API_BASE_URL}/buy/${id}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("購入に失敗しました");
            }    
            
            alert("購入に成功しました");
            navigate("/");
        }catch(err){
            setError(err.message);
            console.error(err.message);
        }
    }

        

    if (error) {
        return <p>{error}</p>;
    }

    if (!item) {
        return <p>Loading...</p>;
    }

    return(
        <div>
            <h1>Buy</h1>
            <h1>{item.name}</h1>
            <img src={item.image_url} alt={item.name} />
            <p>{item.price}円</p>
            <p>出品者: {item.seller}</p>
            <form onSubmit={handleBuy}>
                <input type="submit" value="購入確定" />
            </form>
        </div>
    );
}