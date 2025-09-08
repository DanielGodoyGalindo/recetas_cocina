import { Outlet } from "react-router-dom";
import LogoutButton from "./LogoutButton";
import CreateUserButton from "./CreateUserButton.tsx";
import { useUser, useNotification } from "./Contexts.tsx"
import Notification from "./Notification.tsx";

// Personal project developed by Daniel Godoy
// https://github.com/DanielGodoyGalindo

// Main structure of the app
function Layout() {

    const { token } = useUser();
    const { notification } = useNotification();

    return (
        <div>
            <header>
                <h1 id='main_title'>Mis recetas favoritas</h1>
                {/* if token then render the component */}
                {/* if not, render create user button */}
                {token ? <LogoutButton /> : <CreateUserButton />}
            </header>
            <Outlet /> {/* Renders a child/s defined in the routing configuration */}
            {notification && (<Notification message={notification.message} type={notification.type} />)}
        </div>
    )
}

export default Layout;

