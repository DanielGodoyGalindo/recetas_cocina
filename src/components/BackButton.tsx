import { useNavigate } from "react-router-dom";

function BackButton() {
    const navigate = useNavigate();

    function handleClick() {
        navigate("/");
    }

    return (
        <button type="button" className="back_button" onClick={handleClick}>Volver al listado</button>
    )
}

export default BackButton;