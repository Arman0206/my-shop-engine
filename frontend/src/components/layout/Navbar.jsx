 import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav
      style={{
        backgroundColor: "#007bff",
        padding: "15px 30px",
        display: "flex",
        gap: "25px",
      }}
    >
      <Link to="/" style={{ color: "white", textDecoration: "none" }}>
        Dashboard
      </Link>

      <Link to="/products" style={{ color: "white", textDecoration: "none" }}>
        Products
      </Link>

      <Link to="/cart" style={{ color: "white", textDecoration: "none" }}>
        Cart
      </Link>

      <Link to="/analytics" style={{ color: "white", textDecoration: "none" }}>
        Analytics
      </Link>

      <Link
        to="/recommendations"
        style={{ color: "white", textDecoration: "none" }}
      >
        Recommendations
      </Link>
    </nav>
  );
}

export default Navbar;