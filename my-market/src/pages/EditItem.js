import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fireAuth } from "../firebase";

export default function EditItem() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [item, setItem] = useState(null);
    const [categories, setCategories] = useState([]);
    const [images, setImages] = useState([]);
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [c0Id, setC0Id] = useState("");
    const [c1Id, setC1Id] = useState("");
    //const [aiState, setAiState] = useState([]);
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState([]);

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
            setTags(itemData.tags || []);
            setImages(
                (itemData.image_urls || []).map((url) => ({
                    type: "existing",
                    url,
                    previewUrl: url,
                }))
            );

            const catRes = await fetch(`${API_BASE_URL}/categories`);
            const catData = await catRes.json();

            if (!catRes.ok) {
                throw new Error("カテゴリの取得に失敗しました");
            }

            setCategories(catData);
        };

        load().catch((err) => {
            console.error(err);
            alert(err.message);
        });
    }, [API_BASE_URL, id]);

    const handleUpdate = async (e) => {
        e.preventDefault();

        try {
            const token = await fireAuth.currentUser.getIdToken();

            const formData = new FormData();
            formData.append("name", name);
            formData.append("price", price);
            formData.append("description", description);
            formData.append("c0_id", c0Id);
            formData.append("c1_id", c1Id);
            tags.forEach((tag) => {
                formData.append("tags", tag);
            });

            if (images.length === 0) {
                throw new Error("画像を1枚以上設定してください");
            }

            images.forEach((image, index) => {
                if (image.type === "existing") {
                    formData.append("image_order", `existing:${image.url}`);
                } else {
                    const fileKey = `new:${index}`;
                    formData.append("image_order", fileKey);
                    formData.append(fileKey, image.file);
                }
            });

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
            alert(err.message);
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
            alert(err.message);
        }
    };

    const handleAddTag = () => {
        const tagName = tagInput.trim();

        if (!tagName) return;

        if (tags.length >= 10) {
            alert("タグは最大10個までです");
            return;
        }

        setTags((prev) => [...prev, tagName]);
        setTagInput("");
    };

    const handleRemoveTag = (index) => {
        setTags((prev) => prev.filter((_, i) => i !== index));
    };

    /*const handleGenerateIntroduction = async () => {
        setAiState("紹介文を作っています...");

        try {
            const selectedImage = images.find((image) => image);

            if (!selectedImage) {
                throw new Error("紹介文を生成するには新しい画像を選択してください");
            }

            const formData = new FormData();
            formData.append("image", selectedImage);

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
            alert(err.message);
        }

        setAiState("");
    };*/

    const handleAddImages = (files) => {
        const newImageItems = Array.from(files).map((file) => ({
            type: "new",
            file,
            previewUrl: URL.createObjectURL(file),
        }));

        setImages((prev) => [...prev, ...newImageItems]);
    };

    const handleRemoveImage = (index) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    const moveImage = (index, direction) => {
        setImages((prev) => {
            const next = [...prev];
            const targetIndex = index + direction;

            if (targetIndex < 0 || targetIndex >= next.length) {
                return prev;
            }

            [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
            return next;
        });
    };

    if (!item) return <p>Loading...</p>;

    document.title = `商品編集 | ${item.name} | WhatsOnSale`

    return (
        <div className="item-form-page">
            <h1 className="item-form-title">商品情報を編集</h1>

            <form className="item-form" onSubmit={handleUpdate}>
                <section className="item-form-section">
                <h2>商品画像</h2>

                {images.length === 0 && (
                    <p className="item-form-help">画像を1枚以上選択してください</p>
                )}

                <div className="image-edit-grid">
                    {images.map((image, index) => (
                    <div className="image-edit-card" key={`${image.previewUrl}-${index}`}>
                        {index === 0 && <span className="main-image-badge">メイン</span>}

                        <div className="image-edit-preview-wrap">
                        <img
                            className="image-edit-preview"
                            src={image.previewUrl}
                            alt={`preview-${index + 1}`}
                        />
                        </div>

                        <div className="image-edit-actions">
                        <button
                            type="button"
                            className="circle-button"
                            onClick={() => moveImage(index, -1)}
                            disabled={index === 0}
                        >
                            ←
                        </button>

                        <button
                            type="button"
                            className="circle-button danger"
                            onClick={() => handleRemoveImage(index)}
                        >
                            ×
                        </button>

                        <button
                            type="button"
                            className="circle-button"
                            onClick={() => moveImage(index, 1)}
                            disabled={index === images.length - 1}
                        >
                            →
                        </button>
                        </div>
                    </div>
                    ))}

                    <label className="image-add-card">
                    ＋
                    <span>画像を追加</span>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                        handleAddImages(e.target.files);
                        e.target.value = "";
                        }}
                    />
                    </label>
                </div>
                </section>

                <label className="item-form-field">
                <span>商品名</span>
                <input
                    type="text"
                    placeholder="例: ワイヤレスイヤホン"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                </label>

                <label className="item-form-field">
                <span>価格</span>
                <input
                    type="text"
                    placeholder="例: 3000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                />
                </label>

                <label className="item-form-field">
                <span>説明</span>
                <textarea
                    placeholder="商品の状態や特徴を入力"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                </label>

                <div className="item-form-row">
                <label className="item-form-field">
                <span>大カテゴリ</span>
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
                </label>

                <label className="item-form-field">
                <span>小カテゴリ</span>
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
                </label></div>

                <section className="item-form-section">
                <h2>タグ</h2>

                <div className="tag-input-row">
                    <input
                    type="text"
                    placeholder="例: 夏の定番"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    />
                    <button type="button" onClick={handleAddTag}>
                    追加
                    </button>
                </div>

                <div className="tag-edit-list">
                    {tags.map((tag, index) => (
                    <span className="tag-edit-chip" key={`${tag}-${index}`}>
                        #{tag}
                        <button type="button" onClick={() => handleRemoveTag(index)}>
                        ×
                        </button>
                    </span>
                    ))}
                </div>
                </section>

                <button className="item-submit-button" type="submit">更新する</button>
            </form>

            <button className="item-delete-button" type="button" onClick={handleDelete}>
                出品を取り下げる
            </button>
        </div>
    );
}