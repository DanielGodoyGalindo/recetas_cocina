export async function apiFetch(url: string, options: RequestInit = {}) {
  let token = localStorage.getItem("token");
  const refreshToken = localStorage.getItem("refresh_token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let response = await fetch(`http://localhost:5000${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && refreshToken) {
    const refreshResponse = await fetch(`http://localhost:5000/refresh`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    if (refreshResponse.ok) {
      const data = await refreshResponse.json();
      token = data.access_token;

      localStorage.setItem("token", token ?? "");

      const retryHeaders = {
        ...headers,
        Authorization: `Bearer ${token}`,
      };

      response = await fetch(`http://localhost:5000${url}`, {
        ...options,
        headers: retryHeaders,
      });
    } else {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      throw new Error("Sesión expirada");
    }
  }

  return response.json();
}