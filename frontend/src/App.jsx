import { useMemo, useState } from 'react'
import './App.css'

const initialArticles = [
  {
    id: 1,
    title: 'Hello from Sharing Vision',
    content: 'This is an example published article that appears in the preview view.',
    category: 'Tech',
    status: 'published',
  },
  {
    id: 2,
    title: 'Draft Notes',
    content: 'A draft article waiting to be published later.',
    category: 'Lifestyle',
    status: 'draft',
  },
  {
    id: 3,
    title: 'Old Post',
    content: 'This article is currently in the trash bin.',
    category: 'News',
    status: 'trashed',
  },
  {
    id: 4,
    title: 'Another Published Story',
    content: 'This post is visible in the preview and blog list.',
    category: 'Education',
    status: 'published',
  },
]

const tabs = [
  { key: 'published', label: 'Published' },
  { key: 'draft', label: 'Drafts' },
  { key: 'trashed', label: 'Trashed' },
]

function App() {
  const [articles, setArticles] = useState(initialArticles)
  const [activeView, setActiveView] = useState('allPosts')
  const [activeTab, setActiveTab] = useState('published')
  const [editingArticle, setEditingArticle] = useState(null)
  const [previewPage, setPreviewPage] = useState(1)
  const [form, setForm] = useState({
    title: '',
    content: '',
    category: '',
    status: 'published',
  })

  const publishedArticles = useMemo(
    () => articles.filter((article) => article.status === 'published'),
    [articles],
  )

  const pageSize = 3
  const totalPages = Math.max(1, Math.ceil(publishedArticles.length / pageSize))
  const safePage = Math.min(previewPage, totalPages)
  const previewItems = publishedArticles.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  )

  const visibleArticles = articles.filter((article) => article.status === activeTab)

  const resetForm = () => {
    setForm({ title: '', content: '', category: '', status: 'published' })
  }

  const openEdit = (article) => {
    setEditingArticle(article)
    setForm({
      title: article.title,
      content: article.content,
      category: article.category,
      status: article.status,
    })
    setActiveView('edit')
  }

  const moveToTrash = (articleId) => {
    setArticles((prev) =>
      prev.map((article) =>
        article.id === articleId ? { ...article, status: 'trashed' } : article,
      ),
    )
  }

  const saveEditedArticle = (status) => {
    if (!editingArticle) return

    setArticles((prev) =>
      prev.map((article) =>
        article.id === editingArticle.id
          ? { ...article, ...form, status, title: form.title.trim(), content: form.content.trim(), category: form.category.trim() }
          : article,
      ),
    )
    setEditingArticle(null)
    setActiveView('allPosts')
    resetForm()
  }

  const createArticle = (status) => {
    if (!form.title.trim() || !form.content.trim() || !form.category.trim()) {
      alert('Please complete title, content, and category before saving.')
      return
    }

    const newArticle = {
      id: Date.now(),
      title: form.title.trim(),
      content: form.content.trim(),
      category: form.category.trim(),
      status,
    }

    setArticles((prev) => [newArticle, ...prev])
    resetForm()
    setActiveView('allPosts')
    setActiveTab(status === 'draft' ? 'draft' : 'published')
  }

  const renderAllPosts = () => (
    <section className="panel">
      <div className="panelHeader">
        <h2>All Posts</h2>
      </div>
      <div className="tabRow">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`tabButton ${activeTab === tab.key ? 'active' : ''}`}
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
                    >
                      ✏️
                    </button>
                    <button
                      className="iconButton"
                      onClick={() => moveToTrash(article.id)}
                      aria-label={`Move ${article.title} to trash`}
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  )

  const renderEditor = () => (
    <section className="panel">
      <div className="panelHeader">
        <h2>Edit Article</h2>
      </div>
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
          onChange={(event) => setForm({ ...form, content: event.target.value })}
        />
      </div>
      <div className="formGroup">
        <label>Category</label>
        <input
          value={form.category}
          onChange={(event) => setForm({ ...form, category: event.target.value })}
        />
      </div>
      <div className="buttonRow">
        <button className="primaryButton" onClick={() => saveEditedArticle('published')}>
          Publish
        </button>
        <button className="secondaryButton" onClick={() => saveEditedArticle('draft')}>
          Draft
        </button>
      </div>
    </section>
  )

  const renderNewPost = () => (
    <section className="panel">
      <div className="panelHeader">
        <h2>Add New</h2>
      </div>
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
          onChange={(event) => setForm({ ...form, content: event.target.value })}
        />
      </div>
      <div className="formGroup">
        <label>Category</label>
        <input
          value={form.category}
          onChange={(event) => setForm({ ...form, category: event.target.value })}
        />
      </div>
      <div className="buttonRow">
        <button className="primaryButton" onClick={() => createArticle('published')}>
          Publish
        </button>
        <button className="secondaryButton" onClick={() => createArticle('draft')}>
          Draft
        </button>
      </div>
    </section>
  )

  const renderPreview = () => (
    <section className="panel">
      <div className="panelHeader">
        <h2>Preview</h2>
      </div>
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
          disabled={safePage === 1}
        >
          Previous
        </button>
        <span>
          Page {safePage} of {totalPages}
        </span>
        <button
          className="secondaryButton"
          onClick={() => setPreviewPage((page) => Math.min(totalPages, page + 1))}
          disabled={safePage === totalPages}
        >
          Next
        </button>
      </div>
    </section>
  )

  return (
    <div className="appShell">
      <header className="topbar">
        <h1>Sharing Vision</h1>
        <nav className="navRow">
          <button
            className={`navButton ${activeView === 'allPosts' ? 'active' : ''}`}
            onClick={() => {
              setActiveView('allPosts')
              setActiveTab('published')
            }}
          >
            All Posts
          </button>
          <button
            className={`navButton ${activeView === 'newPost' ? 'active' : ''}`}
            onClick={() => {
              setActiveView('newPost')
              resetForm()
            }}
          >
            Add New
          </button>
          <button
            className={`navButton ${activeView === 'preview' ? 'active' : ''}`}
            onClick={() => setActiveView('preview')}
          >
            Preview
          </button>
        </nav>
      </header>

      <main className="contentArea">
        {activeView === 'allPosts' && renderAllPosts()}
        {activeView === 'edit' && renderEditor()}
        {activeView === 'newPost' && renderNewPost()}
        {activeView === 'preview' && renderPreview()}
      </main>
    </div>
  )
}

export default App
