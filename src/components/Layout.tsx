import { Outlet } from "react-router-dom";
import LogoutButton from "./LogoutButton";
import CreateUserButton from "./CreateUserButton.tsx";

// Main structure of the app
function Layout({ token, onLogout, user }) {

    return (
        <div>
            <header>
                <h1 id='main_title'>Mi App de recetas</h1>
                {/* if token then render the component */}
                {token && <LogoutButton onLogout={onLogout} user={user} />}
                {!token && <CreateUserButton />}
            </header>
            <Outlet /> {/* Renders a child/s defined in the routing configuration */}
        </div>
    )
}

export default Layout;

