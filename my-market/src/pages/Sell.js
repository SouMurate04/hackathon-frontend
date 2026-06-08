import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fireAuth } from "../firebase";


export default function Sell(){
    const [image, setImage] = useState(null);
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();


    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

    const handleSell = async (e) => {
        e.preventDefault();
        setError("");

        const priceNum = Number(price);

        try {
            if(!name || !price || !description || !image){
                throw new Error("空の項目があります");
            }else if(!Number.isSafeInteger(priceNum) || priceNum <= 0){
                throw new Error("価格が正しくありません");
            }

            const token = await fireAuth.currentUser.getIdToken();

            const formData = new FormData();
            formData.append("name", name);
            formData.append("price", price);
            formData.append("description", description);
            formData.append("image", image);

            const response = await fetch(`${API_BASE_URL}/sell`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
            });

            if (!response.ok) {
                throw new Error("出品に失敗しました");
            }    
            
            alert("出品に成功しました");
            navigate("/");
        } catch (err) {
            console.error(err);
            setError(err.message);
        }
    };

    return(
        <div>
            <h1>出品</h1>
            <form onSubmit={handleSell}>
                <input type="file" accept="image/*"
                onChange={(e) => setImage(e.target.files[0])} />


                <input type="text" placeholder="商品名" value={name}
                onChange={(e) => setName(e.target.value)}
                />

                <input type="text" placeholder="価格(円)" value={price}
                onChange={(e) => setPrice(e.target.value)}
                />

                <input type="text" placeholder="説明" value={description}
                onChange={(e) => setDescription(e.target.value)}
                />

                <button type="submit">出品</button>
            </form>
            {error && <p>{error}</p>}
        </div>
    );


}