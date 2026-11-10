import { useEffect, useRef, useState } from "react";

function ProductCard({ image, name, brand, category, price, rating, added, onAddToCart, onView }) {
  const [imgFailed, setImgFailed] = useState(false);
  const cardRef = useRef(null);

  // Report a view once, when at least half of the card is on screen.
  useEffect(() => {
    if (!onView || !cardRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onView();
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(cardRef.current);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showPlaceholder = !image || imgFailed;

  return (
    <div
      ref={cardRef}
      style={{
        border: "1px solid #ddd",
        borderRadius: "10px",
        padding: "15px",
        width: "240px",
        backgroundColor: "white",
        boxShadow: "0 6px 15px rgba(0,0,0,0.15)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {showPlaceholder ? (
        <div
          style={{
            width: "100%",
            height: "150px",
            marginBottom: "10px",
            borderRadius: "8px",
            background: "#eef4ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "48px",
          }}
        >
          📦
        </div>
      ) : (
        <img
          src={image}
          alt={name}
          onError={() => setImgFailed(true)}
          style={{
            width: "100%",
            height: "150px",
            objectFit: "contain",
            marginBottom: "10px",
          }}
        />
      )}

      <h3>{name}</h3>

      <p><strong>Brand:</strong> {brand}</p>
      <p><strong>Category:</strong> {category}</p>
      <p><strong>Price:</strong> ₹{price}</p>
      <p>⭐ {rating}</p>

      <button
        onClick={onAddToCart}
        disabled={added}
        style={{
          backgroundColor: added ? "#16a34a" : "#007bff",
          color: "white",
          border: "none",
          padding: "10px 15px",
          borderRadius: "8px",
          cursor: added ? "default" : "pointer",
          width: "100%",
          fontWeight: "bold",
          marginTop: "auto",
        }}
      >
        {added ? "✓ Added" : "🛒 Add to Cart"}
      </button>
    </div>
  );
}

export default ProductCard;