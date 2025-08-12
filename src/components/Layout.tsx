import { Outlet } from "react-router-dom";

// Main structure of the app
function Layout() {
    return (
        <div>
            <h1 id='main_title'>Mi App de recetas</h1>
            <Outlet /> {/* Renders a child/s defined in the routing configuration */}
        </div>
    )
}

export default Layout;

