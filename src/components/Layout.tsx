import { Outlet } from "react-router-dom";
import LogoutButton from "./LogoutButton";
import CreateUserButton from "./CreateUserButton.tsx";
import { useUser } from "./UserContext.tsx"

// Main structure of the app
function Layout() {
    
    const { token } = useUser();

    return (
        <div>
            <header>
                <h1 id='main_title'>Mi App de recetas</h1>
                {/* if token then render the component */}
                {/* if not, render create user button */}
                {token ? <LogoutButton /> : <CreateUserButton />}
            </header>
            <Outlet /> {/* Renders a child/s defined in the routing configuration */}
        </div>
    )
}

export default Layout;

