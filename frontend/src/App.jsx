import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createArticle as createArticleApi,
  fetchArticleById,
  fetchArticles,
  trashArticle,
  updateArticle,
  deleteArticle as deleteArticleApi,
} from "./services/articleApi";
import { validateArticleForm } from "./utils/validation";
import "./App.css";

const tabs = [
  { key: "published", label: "Published" },
  { key: "draft", label: "Drafts" },
  { key: "trashed", label: "Trashed" },
];

function App() {
  const [articles, setArticles] = useState([]);
  const [activeView, setActiveView] = useState("allPosts");
  const [activeTab, setActiveTab] = useState("published");
  const [editingArticle, setEditingArticle] = useState(null);
  const [previewPage, setPreviewPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "",
    status: "published",
  });

  const loadArticles = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await fetchArticles();
      setArticles(data);
    } catch (err) {
      setError(err.message || "Failed to load articles");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const publishedArticles = useMemo(
    () => articles.filter((article) => article.status === "published"),
    [articles],
  );

  const pageSize = 3;
  const totalPages = Math.max(
    1,
    Math.ceil(publishedArticles.length / pageSize),
  );
  const safePage = Math.min(previewPage, totalPages);
  const previewItems = publishedArticles.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  const visibleArticles = articles.filter(
    (article) => article.status === activeTab,
  );

  const resetForm = () => {
    setForm({ title: "", content: "", category: "", status: "published" });
  };

  const openEdit = async (article) => {
    setLoading(true);
    setError("");

    try {
      const freshArticle = await fetchArticleById(article.id);
      setEditingArticle(freshArticle);
      setForm({
        title: freshArticle.title,
        content: freshArticle.content,
        category: freshArticle.category,
        status: freshArticle.status,
      });
      setActiveView("edit");
    } catch (err) {
      setError(err.message || "Failed to load article");
    } finally {
      setLoading(false);
    }
  };

  const moveToTrash = async (articleId) => {
    const article = articles.find((item) => item.id === articleId);
    if (!article) return;

    setLoading(true);
    setError("");

    try {
      await trashArticle(article);
      await loadArticles();
      setActiveTab("trashed");
    } catch (err) {
      setError(err.message || "Failed to move article to trash");
    } finally {
      setLoading(false);
    }
  };

  const saveEditedArticle = async (status) => {
    if (!editingArticle) return;

    const validationError = validateArticleForm(form);
    if (validationError) {
      alert(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      await updateArticle(editingArticle.id, { ...form, status });
      await loadArticles();
      setEditingArticle(null);
      setActiveView("allPosts");
      setActiveTab(status);
      resetForm();
    } catch (err) {
      setError(err.message || "Failed to update article");
    } finally {
      setLoading(false);
    }
  };

  const createArticle = async (status) => {
    const validationError = validateArticleForm(form);
    if (validationError) {
      alert(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      await createArticleApi({ ...form, status });
      await loadArticles();
      resetForm();
      setActiveView("allPosts");
      setActiveTab(status);
    } catch (err) {
      setError(err.message || "Failed to create article");
    } finally {
      setLoading(false);
    }
  };

  const deleteArticle = async(id)=>{
    setLoading(true);
    setError("");

    try {
      await deleteArticleApi(id);
      await loadArticles();
    } catch (err) {
      setError(err.message || "Failed to delete article");
    } finally {
      setLoading(false);
    }
  }

  const goToAllPosts = () => {
    setActiveView("allPosts");
    setActiveTab("published");
    loadArticles();
  };

  const goToPreview = () => {
    setActiveView("preview");
    setPreviewPage(1);
    loadArticles();
  };

  const renderStatusMessage = () => {
    if (loading) {
      return <p className="statusMessage">Loading...</p>;
    }

    if (error) {
      return <p className="statusMessage errorMessage">{error}</p>;
    }

    return null;
  };

  const renderAllPosts = () => (
    <section className="panel">
      <div className="panelHeader">
        <h2>All Posts</h2>
      </div>
      {renderStatusMessage()}
      <div className="tabRow">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`tabButton ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <table className="dataTable">
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {visibleArticles.length === 0 ? (
            <tr>
              <td colSpan="3">No articles in this section.</td>
            </tr>
          ) : (
            visibleArticles.map((article) => (
              <tr key={article.id}>
                <td>{article.title}</td>
                <td>{article.category}</td>
                <td>
                  <div className="actionIcons">
                    <button
                      className="iconButton"
                      onClick={() => openEdit(article)}
                      aria-label={`Edit ${article.title}`}
                      disabled={loading}
                    >
                      ✏️
                    </button>
                    {article.status !== "trashed" ? (
                      <button
                        className="iconButton"
                        onClick={() => moveToTrash(article.id)}
                        aria-label={`Move ${article.title} to trash`}
                        disabled={loading}
                      >
                        🗑️
                      </button>
                    ):(
                      <button
                        className="iconButton"
                        onClick={() => deleteArticle(article.id)}
                        aria-label={`Delete ${article.title}`}
                        disabled={loading}
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  );

  const renderEditor = () => (
    <section className="panel">
      <div className="panelHeader">
        <h2>Edit Article</h2>
      </div>
      {renderStatusMessage()}
      <div className="formGroup">
        <label>Title</label>
        <input
          value={form.title}
          onChange={(event) => setForm({ ...form, title: event.target.value })}
        />
      </div>
      <div className="formGroup">
        <label>Content</label>
        <textarea
          rows="6"
          value={form.content}
          onChange={(event) =>
            setForm({ ...form, content: event.target.value })
          }
        />
      </div>
      <div className="formGroup">
        <label>Category</label>
        <input
          value={form.category}
          onChange={(event) =>
            setForm({ ...form, category: event.target.value })
          }
        />
      </div>
      <div className="buttonRow">
        <button
          className="primaryButton"
          onClick={() => saveEditedArticle("published")}
          disabled={loading}
        >
          Publish
        </button>
        <button
          className="secondaryButton"
          onClick={() => saveEditedArticle("draft")}
          disabled={loading}
        >
          Draft
        </button>
      </div>
    </section>
  );

  const renderNewPost = () => (
    <section className="panel">
      <div className="panelHeader">
        <h2>Add New</h2>
      </div>
      {renderStatusMessage()}
      <div className="formGroup">
        <label>Title</label>
        <input
          value={form.title}
          onChange={(event) => setForm({ ...form, title: event.target.value })}
        />
      </div>
      <div className="formGroup">
        <label>Content</label>
        <textarea
          rows="6"
          value={form.content}
          onChange={(event) =>
            setForm({ ...form, content: event.target.value })
          }
        />
      </div>
      <div className="formGroup">
        <label>Category</label>
        <input
          value={form.category}
          onChange={(event) =>
            setForm({ ...form, category: event.target.value })
          }
        />
      </div>
      <div className="buttonRow">
        <button
          className="primaryButton"
          onClick={() => createArticle("published")}
          disabled={loading}
        >
          Publish
        </button>
        <button
          className="secondaryButton"
          onClick={() => createArticle("draft")}
          disabled={loading}
        >
          Draft
        </button>
      </div>
    </section>
  );

  const renderPreview = () => (
    <section className="panel">
      <div className="panelHeader">
        <h2>Preview</h2>
      </div>
      {renderStatusMessage()}
      <div className="previewList">
        {previewItems.length === 0 ? (
          <p>No published articles yet.</p>
        ) : (
          previewItems.map((article) => (
            <article key={article.id} className="previewCard">
              <h3>{article.title}</h3>
              <p className="previewMeta">Category: {article.category}</p>
              <p>{article.content}</p>
            </article>
          ))
        )}
      </div>
      <div className="pagination">
        <button
          className="secondaryButton"
          onClick={() => setPreviewPage((page) => Math.max(1, page - 1))}
          disabled={safePage === 1 || loading}
        >
          Previous
        </button>
        <span>
          Page {safePage} of {totalPages}
        </span>
        <button
          className="secondaryButton"
          onClick={() =>
            setPreviewPage((page) => Math.min(totalPages, page + 1))
          }
          disabled={safePage === totalPages || loading}
        >
          Next
        </button>
      </div>
    </section>
  );

  return (
    <div className="appShell">
      <header className="topbar">
        <h1>Sharing Vision</h1>
        <nav className="navRow">
          <button
            className={`navButton ${activeView === "allPosts" ? "active" : ""}`}
            onClick={goToAllPosts}
          >
            All Posts
          </button>
          <button
            className={`navButton ${activeView === "newPost" ? "active" : ""}`}
            onClick={() => {
              setActiveView("newPost");
              resetForm();
            }}
          >
            Add New
          </button>
          <button
            className={`navButton ${activeView === "preview" ? "active" : ""}`}
            onClick={goToPreview}
          >
            Preview
          </button>
        </nav>
      </header>

      <main className="contentArea">
        {activeView === "allPosts" && renderAllPosts()}
        {activeView === "edit" && renderEditor()}
        {activeView === "newPost" && renderNewPost()}
        {activeView === "preview" && renderPreview()}
      </main>
    </div>
  );
}

export default App;
