export const toApiStatus = (status) =>
  ({
    published: "Published",
    draft: "Draft",
    trashed: "Trashed",
  })[status];

export const fromApiStatus = (status) =>
  ({
    Published: "published",
    Draft: "draft",
    Trashed: "trashed",
  })[status];

export const normalizeArticle = (post) => ({
  id: post.id,
  title: post.title,
  content: post.content,
  category: post.category,
  status: fromApiStatus(post.status),
  createdDate: post.created_date,
  updatedDate: post.updated_date,
});
