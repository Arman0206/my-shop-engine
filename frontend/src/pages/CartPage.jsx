 import { useEffect, useState, useCallback } from "react";
import CartService from "../services/CartService";

function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCart = useCallback(() => {
    setLoading(true);
    CartService.getCart()
      .then(setCartItems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let cancelled = false;

    // loading already starts as true via useState(true), no need to set it again here
    CartService.getCart()
      .then((data) => {
        if (!cancelled) setCartItems(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const removeFromCart = async (cartItemId) => {
    try {
      await CartService.removeFromCart(cartItemId);
      loadCart(); // refresh after removal (event handler, not an effect — safe)
    } catch (err) {
      console.error("Failed to remove item:", err);
    }
  };

  const totalPrice = cartItems.reduce(
    (total, item) => total + Number(item.productId?.price || 0) * item.quantity,
    0
  );

  if (loading) {
    return <h2 style={{ textAlign: "center", padding: "60px" }}>Loading cart...</h2>;
  }
  if (error) {
    return <h2 style={{ textAlign: "center", padding: "60px" }}>Error loading cart: {error}</h2>;
  }

  return (
    <div style={{ padding: "30px", backgroundColor: "#f4f6f9", minHeight: "100vh" }}>
      <h1 style={{ fontSize: "48px", fontWeight: "700", marginBottom: "30px", color: "#222" }}>
        🛒 Shopping Cart
      </h1>

      {cartItems.length === 0 ? (
        <h2 style={{ textAlign: "center" }}>Your cart is empty.</h2>
      ) : (
        <>
          {cartItems.map((item) => (
            <div
              key={item._id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
                borderRadius: "16px",
                padding: "15px",
                marginBottom: "15px",
                backgroundColor: "white",
                transition: "0.3s",
              }}
            >
              <div>
                <h3>{item.productId?.productName}</h3>
                <p>Brand: {item.productId?.brand}</p>
                <p>Category: {item.productId?.category}</p>
                <p>⭐ {item.productId?.rating}</p>
                <p>Qty: {item.quantity}</p>
                <h3>₹{item.productId?.price}</h3>
                <button
                  onClick={() => removeFromCart(item._id)}
                  style={{
                    backgroundColor: "#ef4444",
                    padding: "10px 18px",
                    fontWeight: "600",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  ❌ Remove
                </button>
              </div>
            </div>
          ))}
          <hr />
          <div style={{ marginTop: "30px", background: "white", padding: "20px", borderRadius: "16px", boxShadow: "0 8px 25px rgba(0,0,0,0.08)" }}>
            <h2>Total Price: ₹{totalPrice}</h2>
          </div>
        </>
      )}
    </div>
  );
}

export default CartPage;