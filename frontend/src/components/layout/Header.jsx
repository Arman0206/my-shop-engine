 import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import "./Header.css";

import {
    FaBell,
    FaSearch,
    FaUserCircle
} from "react-icons/fa";

function Header(){
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [searchParams] = useSearchParams();
    const currentSearch = searchParams.get("search") || "";

    const [notifOpen, setNotifOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const notifRef = useRef(null);
    const profileRef = useRef(null);

    // Close either dropdown when clicking outside of it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setNotifOpen(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        const params = new URLSearchParams();
        if (value) params.set("search", value);
        navigate(`/products?${params.toString()}`, { replace: true });
    };

    return(

        <header className="header">

            <div className="search-box">

                <FaSearch className="search-icon"/>

                <input
                    className="header-search"
                    type="text"
                    placeholder="Search products..."
                    value={currentSearch}
                    onChange={handleSearchChange}
                />

            </div>

            <div className="header-right">

                <div className="notification" ref={notifRef}>
                    <FaBell
                        className="header-icon"
                        onClick={() => {
                            setNotifOpen((prev) => !prev);
                            setProfileOpen(false);
                        }}
                    />

                    {notifOpen && (
                        <div className="dropdown-panel">
                            <h4>Notifications</h4>
                            <p className="dropdown-empty">
                                You're all caught up — no new notifications yet.
                            </p>
                        </div>
                    )}
                </div>

                <div className="profile" ref={profileRef}>
                    <FaUserCircle
                        className="profile-icon"
                        onClick={() => {
                            setProfileOpen((prev) => !prev);
                            setNotifOpen(false);
                        }}
                    />

                    {profileOpen && (
                        <div className="dropdown-panel">
                            {user ? (
                                <>
                                    <h4>{user.name || user.email}</h4>
                                    <p className="dropdown-empty">{user.email}</p>
                                    <button
                                        type="button"
                                        onClick={() => { setProfileOpen(false); logout(); }}
                                    >
                                        Sign out
                                    </button>
                                </>
                            ) : (
                                <>
                                    <h4>Guest</h4>
                                    <p className="dropdown-empty">
                                        Sign in to use your cart and recommendations.
                                    </p>
                                    <Link to="/login" onClick={() => setProfileOpen(false)}>
                                        Sign in
                                    </Link>
                                </>
                            )}
                        </div>
                    )}
                </div>

            </div>

        </header>

    );

}

export default Header;