import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Home() {

  const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

  const [items, setItems] = useState([]);

  useEffect(() => {
    const load_items = async () => {
      const response = await fetch(`${REACT_APP_API_BASE_URL}/browse`,
        {
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
  }, [REACT_APP_API_BASE_URL]);

  return (
    <div>
      <h1>商品一覧</h1>
      <p>
      <ul>{items.map((item) => (
        <li key={item.id}>
          <Link to={`/item/${item.id}`}>
          <div><img src={item.image_url} alt={item.name} /></div>
          <div>{item.name}</div>
          <div>{item.price}</div>
          <div>{item.description}</div>
          <div>{item.seller}</div>
          <div>{item.category}</div>
          <div>{item.posted_at}</div>
          </Link>
        </li>
      ))}</ul>
      </p>
    </div>
  );
}