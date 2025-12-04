// Add User Modal
const userModal = document.getElementById("userModal");
document.getElementById("openAddUserBtn").onclick = function() {
  userModal.classList.add("active");
};
document.getElementById("closeAddUserBtn").onclick = function() {
  userModal.classList.remove("active");
};
document.getElementById("cancelAddUserBtn").onclick = function() {
  userModal.classList.remove("active");
};

// Edit User Modal
const editModal = document.getElementById("editUserModal");

document.querySelectorAll(".editUserBtn").forEach(function(btn) {
  btn.onclick = function() {
    editModal.classList.add("active");
    document.getElementById("editUserId").value = btn.dataset.id;
    document.getElementById("editStatus").value = btn.dataset.status;
  };
});

document.getElementById("closeEditUserModal").onclick = function() {
  editModal.classList.remove("active");
};
document.getElementById("cancelEditUser").onclick = function() {
  editModal.classList.remove("active");
};
