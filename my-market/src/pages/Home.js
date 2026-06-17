import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";

export default function Home() {

  const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

  const [items, setItems] = useState([]);
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get("keyword") || "";

  useEffect(() => {
    const load_items = async () => {
      const url = keyword
        ? `${REACT_APP_API_BASE_URL}/browse?keyword=${encodeURIComponent(keyword)}`
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
  }, [REACT_APP_API_BASE_URL, keyword]);

  return (
    <div>
      <h1>{keyword ? `「${keyword}」での検索結果` : "商品一覧"}</h1>
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