import "./Layout.css";
import Header from "./Header";
import Sidebar from "./Sidebar";

function Layout({ children }) {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f5f7fb",
      }}
    >
      <Sidebar />

      <div className="main-content">
    <>
    <Header />

    <div className="content">
        {children}
    </div>
</>
      </div>
    </div>
  );
}

export default Layout;