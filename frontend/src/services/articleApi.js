import { normalizeArticle, toApiStatus } from "../utils/status";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const parseResponse = async (response) => {
  const data = await response.json();

  if (data.status === "error") {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

const buildPayload = ({ title, content, category, status }) => ({
  title: title.trim(),
  content: content.trim(),
  category: category.trim(),
  status: toApiStatus(status),
});

export const fetchArticles = async (limit = 1000, offset = 0) => {
  const response = await fetch(`${API_BASE_URL}/article/${limit}/${offset}`);
  const data = await parseResponse(response);
  return (data.posts || []).map(normalizeArticle);
};

export const fetchArticleById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/article/${id}`);
  const data = await parseResponse(response);
  return normalizeArticle(data.post);
};

export const createArticle = async ({ title, content, category, status }) => {
  const response = await fetch(`${API_BASE_URL}/article/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildPayload({ title, content, category, status })),
  });
  const data = await parseResponse(response);
  return normalizeArticle(data.posts);
};

export const updateArticle = async (
  id,
  { title, content, category, status },
) => {
  const response = await fetch(`${API_BASE_URL}/article/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildPayload({ title, content, category, status })),
  });
  const data = await parseResponse(response);
  return normalizeArticle(data.post);
};

export const trashArticle = async (article) =>
  updateArticle(article.id, { ...article, status: "trashed" });


export const deleteArticle = async (id) =>{
  const response = await fetch(`${API_BASE_URL}/article/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
}