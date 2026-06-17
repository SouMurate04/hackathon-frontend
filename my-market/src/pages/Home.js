import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

export default function Home() {

  const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

  const [items, setItems] = useState([]);
  const [searchParams] = useSearchParams();
  const [popularTags, setPopularTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [c0Id, setC0Id] = useState("");
  const [c1Id, setC1Id] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const navigate = useNavigate();

  const keyword = searchParams.get("keyword") || "";
  const queryC0Id = searchParams.get("c0_id") || "";
  const queryC1Id = searchParams.get("c1_id") || "";
  const queryMinPrice = searchParams.get("min_price") || "";
  const queryMaxPrice = searchParams.get("max_price") || "";
  useEffect(() => {
    setC0Id(queryC0Id);
    setC1Id(queryC1Id);
    setMinPrice(queryMinPrice);
    setMaxPrice(queryMaxPrice);
  }, [queryC0Id, queryC1Id, queryMinPrice, queryMaxPrice]);

  const hasFilter = keyword || queryC0Id || queryC1Id || queryMinPrice || queryMaxPrice;


  useEffect(() => {
    const load_items = async () => {

      const params = new URLSearchParams();

      if (keyword) params.set("keyword", keyword);
      if (queryC0Id) params.set("c0_id", queryC0Id);
      if (queryC1Id) params.set("c1_id", queryC1Id);
      if (queryMinPrice) params.set("min_price", queryMinPrice);
      if (queryMaxPrice) params.set("max_price", queryMaxPrice);

      const query = params.toString();

      const url = query
        ? `${REACT_APP_API_BASE_URL}/browse?${query}`
        : `${REACT_APP_API_BASE_URL}/browse`;

      const response = await fetch(url, {
        method: "GET",
      });

      const items_ret = await response.json();

      if (!response.ok) {
        console.error(items_ret);
        alert("Error：" + JSON.stringify(items_ret));
        return;
      }

      setItems(items_ret);
    };

    load_items();
  }, [REACT_APP_API_BASE_URL, keyword, queryC0Id, queryC1Id, queryMinPrice, queryMaxPrice,]);

  useEffect(() => {
    const loadCategories = async () => {
      const res = await fetch(`${REACT_APP_API_BASE_URL}/categories`);

      if (!res.ok) return;

      const data = await res.json();
      setCategories(data);
    };

    loadCategories();
  }, [REACT_APP_API_BASE_URL]);

  useEffect(() => {
    const loadPopularTags = async () => {
      if (keyword) {
        setPopularTags([]);
        return;
      }

      const response = await fetch(`${REACT_APP_API_BASE_URL}/browse/popular-tags?limit=10`);

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      setPopularTags(data);
    };

    loadPopularTags();
  }, [REACT_APP_API_BASE_URL, keyword]);

  const handleFilterSearch = () => {
    if (!c0Id && !minPrice && !maxPrice) {
      return;
    }

    const params = new URLSearchParams();

    if (keyword) params.set("keyword", keyword);
    if (c0Id) params.set("c0_id", c0Id);
    if (c1Id) params.set("c1_id", c1Id);
    if (minPrice) params.set("min_price", minPrice);
    if (maxPrice) params.set("max_price", maxPrice);

    navigate(`/browse?${params.toString()}`);
  };

  return (
    <div>
      {!keyword && popularTags.length > 0 && (
        <div>
          <h2>人気のタグ</h2>
          {popularTags.map((tag) => (
            <Link
              key={tag.name}
              to={`/browse?keyword=${encodeURIComponent(`#${tag.name}`)}`}
            >
              #{tag.name} ({tag.count}){" "}
            </Link>
          ))}
        </div>
      )}
      <h1>{hasFilter ? "検索結果" : "商品一覧"}</h1>
      {keyword && <p>「{keyword}」での検索結果</p>}

      <nav>
        <h2>絞り込み</h2>

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

        <input
          type="number"
          placeholder="最低価格"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />

        <input
          type="number"
          placeholder="最高価格"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />

        <button type="button" onClick={handleFilterSearch}>
          この条件で検索
        </button>
      </nav>

      <p>
      {items.length === 0 ? (
        <p>該当する商品はありません</p>
      ) : (
        <ul>{items.map((item) => (
        <li key={item.id}>
          <Link to={`/item/${item.id}`}>
          <div><img src={item.image_url} alt={item.name} /></div>
          <div>{item.name}</div>
          <div>{item.price}</div>
          <div>{item.description}</div>
          <div>{item.seller}</div>
          <div>{item.c0_name}</div>
          {item.tags && item.tags.length > 0 && (
            <div>
              {item.tags.map((tag, index) => (
                <span key={`${tag}-${index}`}>#{tag} </span>
              ))}
            </div>
          )}
          <div>{item.posted_at}</div>
          </Link>
        </li>
      ))}</ul>
      )}
      </p>
    </div>
  );
}