import { Outlet } from "react-router-dom";
import LogoutButton from "./LogoutButton";
import { useEffect, useState } from "react";

// Main structure of the app
function Layout({token, onLogout}) {

    return (
        <div>
            <header>
                <h1 id='main_title'>Mi App de recetas</h1>
                {token && <LogoutButton onLogout={onLogout} />}
            </header>
            <Outlet /> {/* Renders a child/s defined in the routing configuration */}
        </div>
    )
}

export default Layout;

