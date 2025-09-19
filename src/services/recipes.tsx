export async function createRecipe(formData: FormData, token: string) {
  const res = await fetch("http://localhost:5000/api/recipes", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error al crear receta");
  return data;
}

export async function updateRecipe(id: number, formData: FormData, token: string) {
  const res = await fetch(`http://localhost:5000/api/recipes/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` }, // no Content-Type: lo maneja FormData
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || "Error al actualizar receta");
  return data;
}

export async function deleteRecipe(id: number, token: string) {
  const res = await fetch(`http://localhost:5000/api/recipes/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || "Error al eliminar receta");
  return data;
}
