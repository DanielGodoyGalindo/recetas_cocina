import { Outlet } from "react-router-dom";
import LogoutButton from "./LogoutButton";

// Main structure of the app
function Layout({ token, onLogout, user }) {

    return (
        <div>
            <header>
                <h1 id='main_title'>Mi App de recetas</h1>
                {/* if token then render the component */}
                {token && <LogoutButton onLogout={onLogout} user={user} />}
            </header>
            <Outlet /> {/* Renders a child/s defined in the routing configuration */}
        </div>
    )
}

export default Layout;

