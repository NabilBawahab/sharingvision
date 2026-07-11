export const validateArticleForm = ({ title, content, category }) => {
  const trimmedTitle = title.trim();
  const trimmedContent = content.trim();
  const trimmedCategory = category.trim();

  if (trimmedTitle.length < 20) {
    return "Title must be at least 20 characters long";
  }

  if (trimmedContent.length < 200) {
    return "Content must be at least 200 characters long";
  }

  if (trimmedCategory.length < 3) {
    return "Category must be at least 3 characters long";
  }

  return null;
};
