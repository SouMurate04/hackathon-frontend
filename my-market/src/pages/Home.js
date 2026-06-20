import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";

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

  const [aiQuestion, setAiQuestion] = useState("");
  const [useCurrentFilter, setUseCurrentFilter] = useState(false);
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiItems, setAiItems] = useState([]);
  const [aiReasons, setAiReasons] = useState({});
  const [isAIRecommendOpen, setIsAIRecommendOpen] = useState(false);

  const location = useLocation();
  const isTopPage = location.pathname === "/";

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
    document.title = isTopPage ? "市場 | WhatsOnSale" : "路地 | WhatsOnSale";
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
      alert("項目の入力が不十分です")
      return;
    }
    if(minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) {
      alert("最大価格は最小価格より大きくしてください")
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

  const handleAIRecommendation = async (e) => {
    e.preventDefault();
    setAiAnswer("市場を調査中...");

    if (!aiQuestion.trim()) return;

    const body = {
      question: aiQuestion,
      use_filter: useCurrentFilter,
      keyword: keyword || null,
      c0_id: queryC0Id ? Number(queryC0Id) : null,
      c1_id: queryC1Id ? Number(queryC1Id) : null,
      min_price: queryMinPrice ? Number(queryMinPrice) : null,
      max_price: queryMaxPrice ? Number(queryMaxPrice) : null,
    };

    const res = await fetch(`${REACT_APP_API_BASE_URL}/browse/ai-recommendation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(text);
      alert("AI推薦に失敗しました");
      return;
    }

    const data = await res.json();

    setAiAnswer(data.answer);
    setAiItems(data.items);
    setAiReasons(data.reasons || {});
  };

  return (
    <div>

      <button
        type="button"
        className="ai-recommend-fab"
        onClick={() => setIsAIRecommendOpen(true)}
      >
        案内人に聞く
      </button>

      {isAIRecommendOpen && (
        <div
          className="ai-recommend-overlay"
          onClick={() => setIsAIRecommendOpen(false)}
        >
          <section
            className="ai-recommend-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ai-recommend-header">
              <h2>こんにちは！この市場のAI案内人です。</h2>
              <button
                type="button"
                className="ai-recommend-close"
                onClick={() => setIsAIRecommendOpen(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAIRecommendation} className="ai-recommend-form">
              <textarea
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder="例: 夏に使える安いバッグが欲しい"
                className="ai-recommend-input"
              />

              <label className="ai-filter-option">
                <input
                  type="checkbox"
                  checked={useCurrentFilter}
                  onChange={(e) => setUseCurrentFilter(e.target.checked)}
                />
                <span>現在の検索条件を考慮する</span>
              </label>

              <button type="submit" className="ai-recommend-submit">
                おすすめを聞く
              </button>
            </form>

            {aiAnswer && (
              <p className="ai-answer">
                {aiAnswer}
              </p>
            )}

            {aiItems.length > 0 && (
              <ul className="item-grid ai-item-grid">
                {aiItems.map((item) => (
                  <li key={item.id} className="item-card">
                    <Link to={`/item/${item.id}`} className="item-card-link">
                      {aiReasons[item.id] && (
                        <div className="item-meta">{aiReasons[item.id]}</div>
                      )}

                      <div className="item-image-wrap">
                        <img className="item-image" src={item.image_url} alt={item.name} />
                      </div>

                      <div className="item-title">{item.name}</div>
                      <div className="item-price">{item.price}円</div>
                      <div className="item-meta">{item.seller}</div>
                      <div className="item-meta">{item.c0_name} / {item.c1_name}</div>

                      {item.tags && item.tags.length > 0 && (
                        <div className="item-tags">
                          {item.tags.map((tag, index) => (
                            <span className="item-tag" key={`${tag}-${index}`}>
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}

      {isTopPage && (
        <section className="home-top-section">
          <div className="popular-tags-panel">
          {!keyword && popularTags.length > 0 && (<>
            
              <h2 className="home-section-title">How's it going?</h2>

              <div className="popular-tags-list item-tags" >
                {popularTags.map((tag) => (
                  <Link
                    className="item-tag"
                    key={tag.name}
                    to={`/browse?keyword=${encodeURIComponent(`#${tag.name}`)}`}
                  >
                    #{tag.name} ({tag.count})
                  </Link>
                ))}
              </div>
          <div className="home-action-row">
            <Link to="/subscription" className="subscription-link">
              フォロー中のユーザーの出品
            </Link>
          </div>
          </>)}
          </div>

          
        </section>
      )}

      <nav className="filter-panel">
        <div className="filter-header">
          <h2>絞り込み</h2>
        </div>

        <div className="filter-controls">
          <label className="filter-field">
            <span>大カテゴリ</span>
            <select
              value={c0Id}
              onChange={(e) => {
                setC0Id(e.target.value);
                setC1Id("");
              }}
            >
              <option value="">指定なし</option>
              {categories.map((c0) => (
                <option key={c0.id} value={c0.id}>
                  {c0.name}
                </option>
              ))}
            </select>
          </label>

          <label className="filter-field">
            <span>小カテゴリ</span>
            <select
              value={c1Id}
              onChange={(e) => setC1Id(e.target.value)}
              disabled={!c0Id}
            >
              <option value="">指定なし</option>
              {categories
                .find((c0) => String(c0.id) === String(c0Id))
                ?.children.map((c1) => (
                  <option key={c1.id} value={c1.id}>
                    {c1.name}
                  </option>
                ))}
            </select>
          </label>

          <label className="filter-field filter-price-field">
            <span>最低価格</span>
            <input
              type="number"
              placeholder="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
          </label>

          <label className="filter-field filter-price-field">
            <span>最高価格</span>
            <input
              type="number"
              placeholder="10000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </label>

          <button
            type="button"
            onClick={handleFilterSearch}
            className="filter-submit"
          >
            この条件で検索
          </button>
        </div>
      </nav>

      <section className="browse-title-section">
        <h1>{hasFilter ? "検索結果" : "商品一覧"}</h1>
        {keyword && <p>「{keyword}」での検索結果</p>}
      </section>

      <p>
      {items.length === 0 ? (
        <p>該当する商品はありません</p>
      ) : (
      <ul className="item-grid">
        {items.map((item) => (
          <li key={item.id} className="item-card">
            <Link to={`/item/${item.id}`} className="item-card-link">
              <div className="item-image-wrap">
                <img className="item-image" src={item.image_url} alt={item.name} />
              </div>

              <div className="item-title">{item.name}</div>
              <div className="item-price">{item.price}円</div>
              <div className="item-meta">{item.seller}</div>
              <div className="item-meta">{item.c0_name} / {item.c1_name}</div>

              {item.tags && item.tags.length > 0 && (
                <div className="item-tags">
                  {item.tags.map((tag, index) => (
                    <span className="item-tag" key={`${tag}-${index}`}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="item-meta">{item.posted_at}</div>
            </Link>
          </li>
        ))}
      </ul>
      )}
      </p>
    </div>
  );
}