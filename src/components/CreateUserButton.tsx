import { useNavigate } from "react-router-dom";

function CreateUserButton() {
    const navigate = useNavigate();

    return (
        <div id="create_user_button">
            <button onClick={() => navigate("/create-user")}>
                Nuevo usuario
            </button>
        </div>
    );
}

export default CreateUserButton;
