import "./ProductCatalog.css";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/products/ProductCard";
import ProductService from "../services/ProductService";
import CartService from "../services/CartService";

function ProductCatalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const [category, setCategory] = useState("All Categories");
  const [brand, setBrand] = useState("All Brands");
  const [addedIds, setAddedIds] = useState([]);

  useEffect(() => {
    ProductService.getAllProducts()
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.productName
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory = category === "All Categories" || product.category === category;
    const matchesBrand = brand === "All Brands" || product.brand === brand;
    return matchesSearch && matchesCategory && matchesBrand;
  });

  const addToCart = async (product) => {
    try {
      await CartService.addToCart(product._id, 1);
      setAddedIds((prev) => [...prev, product._id]);
    } catch (err) {
      console.error("Failed to add to cart:", err);
    }
  };

  if (loading) {
    return <h2 style={{ textAlign: "center", padding: "60px" }}>Loading products...</h2>;
  }
  if (error) {
    return <h2 style={{ textAlign: "center", padding: "60px" }}>Error loading products: {error}</h2>;
  }

  return (
    <div style={{ padding: "30px", backgroundColor: "#f4f6f9", minHeight: "100vh" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "15px", margin: "20px 0 30px", flexWrap: "wrap" }}>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option>All Categories</option>
          <option>Electronics</option>
          <option>Accessories</option>
        </select>
        <select value={brand} onChange={(e) => setBrand(e.target.value)}>
          <option>All Brands</option>
          <option>Dell</option>
          <option>Logitech</option>
          <option>Samsung</option>
          <option>Sony</option>
          <option>HP</option>
        </select>
      </div>
      <div className="product-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard
              key={product._id}
              image={product.image}
              name={product.productName}
              brand={product.brand}
              category={product.category}
              price={product.price}
              rating={product.rating}
              added={addedIds.includes(product._id)}
              onAddToCart={()=>addToCart(product)}
              onView={() => ProductService.trackView(product._id)}
            />
          ))
        ) : (
          <h2 style={{ width: "100%", textAlign: "center" }}>No products found.</h2>
        )}
      </div>
    </div>
  );
}

export default ProductCatalog;