 import "./Sidebar.css";

import { Link, useLocation } from "react-router-dom";

import {
    FaHome,
    FaBoxOpen,
    FaShoppingCart,
    FaChartBar,
    FaRobot
} from "react-icons/fa";

function Sidebar(){

    const location=useLocation();

    const menu=[
        {
            name:"Dashboard",
            path:"/",
            icon:<FaHome/>
        },
        {
            name:"Products",
            path:"/products",
            icon:<FaBoxOpen/>
        },
        {
            name:"Cart",
            path:"/cart",
            icon:<FaShoppingCart/>
        },
        {
            name:"Analytics",
            path:"/analytics",
            icon:<FaChartBar/>
        },
        {
            name:"Recommendations",
            path:"/recommendations",
            icon:<FaRobot/>
        }
    ];

    return(

        <div className="sidebar">

            <div className="logo">

                <h2>🛒 SmartCart</h2>

                <p>Optimization Engine</p>

            </div>

            {

                menu.map((item)=>(

                    <Link

                        key={item.path}

                        to={item.path}

                        className={`menu-item ${
                            location.pathname===item.path
                            ? "active"
                            : ""
                        }`}

                    >

                        <span className="menu-icon">

                            {item.icon}

                        </span>

                        {item.name}

                    </Link>

                ))

            }

        </div>

    )

}

export default Sidebar;