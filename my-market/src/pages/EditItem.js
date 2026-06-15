import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fireAuth } from "../firebase";

export default function EditItem() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [item, setItem] = useState(null);
    const [categories, setCategories] = useState([]);
    const [image, setImage] = useState(null);
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [c0Id, setC0Id] = useState("");
    const [c1Id, setC1Id] = useState("");
    const [error, setError] = useState("");

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

    useEffect(() => {
        const load = async () => {
            const itemRes = await fetch(`${API_BASE_URL}/browse/${id}`);
            const itemData = await itemRes.json();

            if (!itemRes.ok) {
                throw new Error("商品情報の取得に失敗しました");
            }

            if (itemData.buyer_id) {
                throw new Error("売却済みの商品は編集できません");
            }

            setItem(itemData);
            setName(itemData.name);
            setPrice(String(itemData.price));
            setDescription(itemData.description || "");
            setC0Id(String(itemData.c0_id || ""));
            setC1Id(String(itemData.c1_id || ""));

            const catRes = await fetch(`${API_BASE_URL}/categories`);
            const catData = await catRes.json();

            if (!catRes.ok) {
                throw new Error("カテゴリの取得に失敗しました");
            }

            setCategories(catData);
        };

        load().catch((err) => {
            console.error(err);
            setError(err.message);
        });
    }, [API_BASE_URL, id]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const token = await fireAuth.currentUser.getIdToken();

            const formData = new FormData();
            formData.append("name", name);
            formData.append("price", price);
            formData.append("description", description);
            formData.append("c0_id", c0Id);
            formData.append("c1_id", c1Id);

            if (image) {
                formData.append("image", image);
            }

            const res = await fetch(`${API_BASE_URL}/sell/${id}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!res.ok) {
                const text = await res.text();
                console.error(text);
                throw new Error("商品情報の更新に失敗しました");
            }

            alert("商品情報を更新しました");
            navigate(`/item/${id}`);
        } catch (err) {
            console.error(err);
            setError(err.message);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("出品を取り下げますか？")) return;

        try {
            const token = await fireAuth.currentUser.getIdToken();

            const res = await fetch(`${API_BASE_URL}/sell/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                const text = await res.text();
                console.error(text);
                throw new Error("出品取り下げに失敗しました");
            }

            alert("出品を取り下げました");
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
                throw new Error("紹介文を生成するには新しい画像を選択してください");
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

    if (error) return <p>{error}</p>;
    if (!item) return <p>Loading...</p>;

    return (
        <div>
            <h1>商品情報を編集</h1>

            <form onSubmit={handleUpdate}>
                <img src={item.image_url} alt={item.name} />

                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files[0])}
                />

                <button type="button" onClick={handleGenerateIntroduction}>
                    紹介文を生成
                </button>

                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <input
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                />

                <input
                    type="text"
                    value={description}
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
                    {categories
                        .find((c0) => String(c0.id) === String(c0Id))
                        ?.children.map((c1) => (
                            <option key={c1.id} value={c1.id}>
                                {c1.name}
                            </option>
                        ))}
                </select>

                <button type="submit">更新する</button>
            </form>

            <button type="button" onClick={handleDelete}>
                出品を取り下げる
            </button>
        </div>
    );
}