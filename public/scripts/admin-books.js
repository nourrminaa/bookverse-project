// Add Book Modal
function openModal() {
  document.getElementById("bookModal").classList.add("active");
}
function closeModal() {
  document.getElementById("bookModal").classList.remove("active");
}

// Edit Book Modal
function openEditModal(id, title, author, price, oldPrice, img, description, stock, category) {
  document.getElementById("editBookId").value = id;
  document.getElementById("editTitle").value = title;
  document.getElementById("editAuthor").value = author;
  document.getElementById("editPrice").value = price;
  document.getElementById("editOldPrice").value = oldPrice || "";
  document.getElementById("editImg").value = img;
  document.getElementById("editDescription").value = description;
  document.getElementById("editStock").value = stock;
  document.getElementById("editCategory").value = category;
  document.getElementById("editModal").classList.add("active");
}
function closeEditModal() {
  document.getElementById("editModal").classList.remove("active");
}
