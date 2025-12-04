function viewOrder(orderId) {
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "/admin/orders/get", true);
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onload = function () {
    if (xhr.status === 200) {
      var response = JSON.parse(xhr.responseText);

      if (!response.success) return;

      var order = response.order;

      document.getElementById("viewOrderId").value = order.id;
      document.getElementById("viewCustomer").value = order.customer;
      document.getElementById("viewDate").value = order.date;
      document.getElementById("viewStatus").value = order.status;

      var itemsHtml = "";

      order.items.forEach(function (item) {
        itemsHtml += `
          <div class="order-item-row">
            <p><strong>${item.title}</strong> (${item.author})</p>
            <p>Qty: ${item.quantity}</p>
            <p>Price: $${item.price}</p>
            <p>Subtotal: $${(item.price * item.quantity).toFixed(2)}</p>
            <hr>
          </div>
        `;
      });

      document.getElementById("viewOrderItems").innerHTML = itemsHtml;

      document.getElementById("viewOrderModal").classList.add("active");
    }
  };

  xhr.send(JSON.stringify({ id: orderId }));
}

function closeViewOrderModal() {
  document.getElementById("viewOrderModal").classList.remove("active");
}
