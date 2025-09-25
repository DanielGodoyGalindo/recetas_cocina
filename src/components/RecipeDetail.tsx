import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BackButton from "./BackButton.tsx";
import { Recipe, Comment, Step } from "../Types";
import { useUser, useNotification } from "./Contexts.tsx";
import AddToFavButton from "./AddToFavButton.tsx";
import ShareButtons from "./ShareButtons.tsx";
import { apiFetch } from "../services/Api.ts";
import { User } from "../Types";

interface RecipeDetailProps {
	onDelete: (recipeId: number) => Promise<void>, // function
	token: string | null; // value
	user: User | null; // value

}

function RecipeDetail({ onDelete }: RecipeDetailProps) {

	// Hooks
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { user, token } = useUser();
	const { alert } = useNotification();

	// States
	const [recipe, setRecipe] = useState<Recipe | null>(null);
	const [comments, setComments] = useState<Comment[]>([]);
	const [newComment, setNewComment] = useState("");
	const [newVote, setNewVote] = useState(5);
	const [steps, setSteps] = useState<Step[]>([]);
	const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
	const [editingText, setEditingText] = useState("");
	const [editingVote, setEditingVote] = useState(5);

	// Variables
	const isCreator = user?.username === recipe?.created_by;
	const isAdmin = user?.role === "admin";

	useEffect(() => {
		if (!id) return;

		const fetchRecipe = async () => {
			try {
				const data = await apiFetch(`/api/recipes/${id}`);
				setRecipe({
					...data,
					ingredients: data.ingredients || {},
				});
				if (data.error) {
					alert(data.error, "error");
					navigate("/");
				}
			} catch (err) {
				console.error("Error cargando receta:", err);
			}
		};

		const fetchComments = async () => {
			try {
				const data = await apiFetch(`/api/recipes/${id}/comments`);
				setComments(data);
			} catch (err) {
				console.error("Error cargando comentarios:", err);
			}
		};

		fetchRecipe();
		fetchComments();
	}, [id, alert, navigate]);

	useEffect(() => {
		if (!recipe) return;

		if (recipe.steps && recipe.steps.length > 0) {
			setSteps(recipe.steps);
		} else {
			const fetchStepsFromDB = async () => {
				try {
					const data = await apiFetch(`/api/recipes/${recipe.id}/steps`);
					setSteps(data);
				} catch (err) {
					console.error("Error obteniendo pasos desde BDD:", err);
				}
			};
			fetchStepsFromDB();
		}
	}, [recipe]);

	const handleDelete = async () => {
		if (recipe?.id !== undefined) {
			await onDelete(recipe.id);
			navigate("/");
		}
	};

	const handleAddComment = async () => {
		if (!newComment || !newVote) return;

		try {
			const res = await fetch(`http://localhost:5000/api/recipes/${recipe?.id}/comments`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${token}`,
				},
				body: JSON.stringify({ text_comment: newComment, vote: newVote })
			});

			console.log(res);
			const data = await res.json();
			if (!res.ok) {
				alert(data.msg, "error");
				return;
			}
			const addedComment = data.new_comment;
			setComments([...comments, addedComment]);
			setNewComment("");
			setNewVote(5);
			alert(data.msg, "success");
		} catch (err) {
			alert("No se pudo añadir el comentario", "error");
		}
	};

	const handleDeleteComment = async (comment_id: number) => {
		try {
			const data = await apiFetch(
				`/api/recipes/${recipe?.id}/comments/delete/${comment_id}`,
				{ method: "DELETE" }
			);
			if (data.msg === '¡No tienes permisos para borrar el comentario!')
				alert(data.msg, "error");
			else {
				alert(data.msg, "success");
				// update comments state without deleted comment
				setComments((prev) => prev.filter((c) => c.id !== comment_id));
			}
		} catch (e) {
			console.log("Error borrando el comentario: ", e);
		}
	};

	const handleUpdateComment = async (commentId: number) => {
		try {
			const data = await apiFetch(
				`/api/comments/${commentId}`,
				{
					method: "PUT",
					body: JSON.stringify({ text_comment: editingText, vote: editingVote })
				}
			);

			if ("error" in data) {
				alert(data.error, "error");
				return;
			}

			if (!data.msg) {
				alert(data.error || "Error actualizando comentario", "error");
				return;
			}

			setComments((prev) =>
				prev.map((c) =>
					c.id === commentId ? { ...c, text_comment: editingText, vote: editingVote } : c
				)
			);

			setEditingCommentId(null);
			setEditingText("");
			setEditingVote(5);
			alert(data.msg, "success");
		} catch (err) {
			console.log("Error editando el comentario: ", err);
			alert("No se pudo actualizar el comentario", "error");
		}
	};

	if (!recipe) return <p>Cargando receta...</p>;

	// Personal project developed by Daniel Godoy
	// https://github.com/DanielGodoyGalindo

	return (
		<div className="recipe_detail">
			<h1>{recipe.title}</h1>
			<div className="recipe_details_image">
				<div className="recipe_detail_main">
					<p><strong>Descripción:</strong> {recipe.description}</p>

					{/* Ingredients list */}
					<h3>Ingredientes</h3>
					{Object.keys(recipe.ingredients).length > 0 ? (
						<ul>
							{Object.entries(recipe.ingredients).map(([name, quantity]) => (
								<li key={name}>
									{name}: {quantity}
								</li>
							))}
						</ul>
					) : (
						<p>No se han añadido ingredientes.</p>
					)}

					{/* Buttons */}
					{recipe.id && recipe.id < 1000 ?
						<div className="recipe_buttons">
							{user && (user.role === "admin" || user.username === recipe.created_by) && (
								<>
									<button className="recipe_button" onClick={() => navigate(`/edit_recipe/${recipe.id}`)}>✏️ Editar</button>
									<button className="recipe_button" onClick={handleDelete}>🗑️ Eliminar</button>
								</>
							)}
							<AddToFavButton />
						</div>
						: ""}
				</div>
				{recipe.id && recipe.id < 1000 ?
					<img src={recipe.imagePath} alt={recipe.title} className="image_sample" />
					: ""}
			</div>


			{/* Steps */}
			<div id="steps_container">
				<h3 style={{ textAlign: "center" }}>Pasos</h3>
				<ol>
					{steps.map((step, index) => (
						<li key={index + 1}>
							{step.instruction} <strong>{"(" + step.duration_min} {" min)"}</strong>
						</li>
					))}
				</ol>
				<span>
					<i><strong>Tiempo total:{" "}
						{steps.reduce((total, step) => total + step.duration_min, 0)} min</strong></i>
				</span>
			</div>

			<div>
				<ShareButtons recipe={recipe} />
			</div>

			{/* Comments */}
			{recipe.id && recipe.id < 1000 ?
				<div id="comments_container">
					<h3>Comentarios</h3>
					{comments.length > 0 ? (
						comments.map((comment) => (
							<div className="recipe_comment" key={comment.id}>
								{editingCommentId === comment.id ? (
									<>
										<textarea
											value={editingText}
											onChange={(e) => setEditingText(e.target.value)}
										/>
										<select
											value={editingVote}
											onChange={(e) => setEditingVote(Number(e.target.value))}
										>
											{[1, 2, 3, 4, 5].map((n) => (
												<option key={n} value={n}>{n}⭐</option>
											))}
										</select>
									</>
								) : (
									<p>{comment.text_comment} ({comment.vote}⭐)</p>
								)}
								<p id="p_comment"><strong>- {comment.username}</strong></p>

								{comment.username === user?.username && (
									<button
										onClick={() => {
											if (editingCommentId === comment.id) {
												handleUpdateComment(comment.id);
											} else {
												setEditingCommentId(comment.id);
												setEditingText(comment.text_comment);
												setEditingVote(comment.vote);
											}
										}}
										id="edit_comment_button"
									>
										{editingCommentId === comment.id ? "Aceptar" : "Editar"}
									</button>
								)}
								{comment.username === user?.username && (
									<button onClick={() => handleDeleteComment(comment.id)} id="delete_comment_button">Borrar</button>
								)}
							</div>
						))
					) : (
						<p>No hay comentarios aún.</p>
					)}
				</div> : ""}


			{(recipe.id && recipe.id < 1000) && (isAdmin || !isCreator) && (
				<div id="add_comment_container">
					<h4>Deja tu comentario</h4>
					<textarea
						value={newComment}
						onChange={(e) => setNewComment(e.target.value)}
						placeholder="Escribe tu comentario..."
					/>
					<div id="vote_input_button">
						<select value={newVote} onChange={(e) => setNewVote(Number(e.target.value))}>
							{[1, 2, 3, 4, 5].map((n) => (
								<option key={n} value={n}>{n}⭐</option>
							))}
						</select>
						<button onClick={handleAddComment}>Añadir comentario</button>
					</div>
				</div>
			)}

			{(recipe.id && recipe.id < 1000) && (!isAdmin && isCreator) && <p>No puedes comentar tu propia receta.</p>}

			<BackButton />
		</div>
	);
}

export default RecipeDetail;