export const getApiBaseUrl = () => {
  const base =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
    "http://localhost:5000";
  return base;
};

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export const authFetch = async (path, options = {}) => {
  if (typeof window === "undefined") {
    throw new ApiError("authFetch must be used in the browser", 500);
  }

  const token = window.localStorage.getItem("valise_token");
  if (!token) {
    throw new ApiError("Authentication token missing", 401);
  }

  const { headers: initHeaders, body, ...rest } = options;
  const headers = new Headers(initHeaders || {});

  if (!(body instanceof FormData) && !headers.has("Content-Type") && body) {
    headers.set("Content-Type", "application/json");
  }

  headers.set("Authorization", `Bearer ${token}`);

  const fetchOptions = {
    ...rest,
    headers,
  };

  if (body) {
    fetchOptions.body =
      body instanceof FormData || typeof body === "string"
        ? body
        : JSON.stringify(body);
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, fetchOptions);

  let data;
  try {
    data = await response.json();
  } catch (err) {
    data = null;
  }

  if (!response.ok) {
    const message =
      data?.error ||
      data?.message ||
      `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status);
  }

  return data;
};

export const clearAuthToken = () => {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem("valise_token");
  }
};

