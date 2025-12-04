// View Order Modal
function viewOrder(orderId) {
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "/admin/orders/get", true);
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onload = function () {
    if (xhr.status === 200) {
      var response = JSON.parse(xhr.responseText);

      if (!response.success) return;

      var order = response.order;

      document.getElementById("viewOrderId").value = "#" + order.id;
      document.getElementById("viewCustomer").value = order.customer_name;
      document.getElementById("viewDate").value = new Date(
        order.created_at
      ).toLocaleDateString();
      document.getElementById("viewStatus").value = order.status;

      var itemsHtml = "";

      if (order.items && order.items.length > 0) {
        order.items.forEach(function (item) {
          itemsHtml +=
            '<div class="order-item-row" style="padding: 10px 0; border-bottom: 1px solid #eee;">' +
            "<p><strong>" +
            item.title +
            "</strong> by " +
            item.author +
            "</p>" +
            "<p>Qty: " +
            item.quantity +
            " × $" +
            item.price +
            " = $" +
            (item.price * item.quantity).toFixed(2) +
            "</p>" +
            "</div>";
        });

        itemsHtml +=
          '<div style="margin-top: 15px; font-weight: bold;">Total: $' +
          order.total +
          "</div>";
      } else {
        itemsHtml = "<p>No items found</p>";
      }

      document.getElementById("viewOrderItems").innerHTML = itemsHtml;
      document.getElementById("viewOrderModal").classList.add("active");
    }
  };

  xhr.send(JSON.stringify({ id: orderId }));
}

function closeViewOrderModal() {
  document.getElementById("viewOrderModal").classList.remove("active");
}

// Edit Order Modal
function editOrder(orderId, currentStatus) {
  document.getElementById("editOrderId").value = orderId;
  document.getElementById("modalOrderId").value = "#" + orderId;
  document.getElementById("modalStatus").value = currentStatus;
  document.getElementById("orderModal").classList.add("active");
}

function closeOrderModal() {
  document.getElementById("orderModal").classList.remove("active");
}