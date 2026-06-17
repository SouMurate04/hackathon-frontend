import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fireAuth } from "../firebase";


export default function Sell(){
    const [image, setImage] = useState(null);
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");
    const [categories, setCategories] = useState([]);
    const [c0Id, setC0Id] = useState("");
    const [c1Id, setC1Id] = useState("");
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState([]);
    const navigate = useNavigate();

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

    useEffect(() => {
    const loadCategories = async () => {
        try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error("カテゴリの取得に失敗しました");
        }

        setCategories(data);
        } catch (err) {
        console.error(err);
        setError(err.message);
        }
    };

    loadCategories();
    }, [API_BASE_URL]);

    const handleSell = async (e) => {
        e.preventDefault();
        setError("");

        const priceNum = Number(price);

        try {
            if(!name || !price || !description || !image || !c0Id || !c1Id){
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
            formData.append("c0_id", c0Id);
            formData.append("c1_id", c1Id);
            tags.forEach((tag) => {
                formData.append("tags", tag);
            });

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

    const handleGenerateIntroduction = async () => {
        setError("");

        try {
            if (!image) {
                throw new Error("紹介文を生成するには画像を選択してください");
            }

            const formData = new FormData();
            formData.append("image", image);

            const response = await fetch(`${API_BASE_URL}/sell/recommend`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const text = await response.text();
                console.error(text);
                throw new Error("紹介文の生成に失敗しました");
            }

            const data = await response.json();

            setName(data.name);
            setDescription(data.description);
            setC0Id(String(data.c0_id));
            setC1Id(String(data.c1_id));
        } catch (err) {
            console.error(err);
            setError(err.message);
        }
    };

    const handleAddTag = () => {
        const tagName = tagInput.trim();

        if (!tagName) return;

        if (tags.length >= 10) {
            setError("タグは最大10個までです");
            return;
        }

        setTags((prev) => [...prev, tagName]);
        setTagInput("");
    };

    const handleRemoveTag = (index) => {
        setTags((prev) => prev.filter((_, i) => i !== index));
    };

    return(
        <div>
            <h1>出品</h1>
            <form onSubmit={handleSell}>
                <input type="file" accept="image/*"
                onChange={(e) => setImage(e.target.files[0])} />

                <button type="button" onClick={handleGenerateIntroduction}>
                    紹介文を生成
                </button>

                <input type="text" placeholder="商品名" value={name}
                onChange={(e) => setName(e.target.value)}
                />

                <input type="text" placeholder="価格(円)" value={price}
                onChange={(e) => setPrice(e.target.value)}
                />

                <input type="text" placeholder="説明" value={description}
                onChange={(e) => setDescription(e.target.value)}
                />

                <select
                    value={c0Id}
                    onChange={(e) => {
                        setC0Id(e.target.value);
                        setC1Id("");
                    }}
                >
                    <option value="">大カテゴリを選択</option>
                    {categories.map((c0) => (
                        <option key={c0.id} value={c0.id}>
                        {c0.name}
                        </option>
                    ))}
                </select>

                <select
                    value={c1Id}
                    onChange={(e) => setC1Id(e.target.value)}
                    disabled={!c0Id}
                >
                    <option value="">小カテゴリを選択</option>
                    {categories.find((c0) => String(c0.id) === String(c0Id))?.children.map((c1) => (
                        <option key={c1.id} value={c1.id}>
                        {c1.name}
                        </option>
                    ))}
                </select>

                <div>
                    <input
                        type="text"
                        placeholder="タグを入力"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                    />
                    <button type="button" onClick={handleAddTag}>
                        タグを追加
                    </button>
                </div>

                <div>
                    {tags.map((tag, index) => (
                        <span key={`${tag}-${index}`}>
                            #{tag}
                            <button type="button" onClick={() => handleRemoveTag(index)}>
                                削除
                            </button>
                        </span>
                    ))}
                </div>

                <button type="submit">出品</button>
            </form>
            {error && <p>{error}</p>}
        </div>
    );


}