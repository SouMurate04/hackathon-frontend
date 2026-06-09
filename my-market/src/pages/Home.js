import { useState, useEffect } from "react";

export default function Home() {

  const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

  const [items, setItems] = useState([]);

  const load_items = async () => {
    const response = await fetch(`${REACT_APP_API_BASE_URL}/items`,
      {
        method: "GET",
      });
      const items = await response.json();
      if (!response.ok) {
        console.error(history);
        alert("Error：" + JSON.stringify(history));
        return;
      }
      setItems(items);
  }

  useEffect(() => {
    load_items();
  }, []);

  return (
    <div>
      <h1>商品一覧</h1>
      <p>
      <ul>{items.map((item) => (
        <li>
          <div><img src={item.image_url} alt={item.name} /></div>
          <div>{item.name}</div>
          <div>{item.price}</div>
          <div>{item.description}</div>
        </li>
      ))}</ul>
      </p>
    </div>
  );
}