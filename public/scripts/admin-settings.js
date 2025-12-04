// FAQ counter for new items
var faqCounter = document.querySelectorAll(".faq-item").length;

// add new FAQ
document.getElementById("addFaqBtn").onclick = function() {
  var container = document.getElementById("faqContainer");
  var newFaq = document.createElement("div");
  newFaq.className = "faq-item";
  newFaq.setAttribute("data-index", faqCounter);
  newFaq.style.border = "1px solid #ddd";
  newFaq.style.padding = "15px";
  newFaq.style.marginBottom = "15px";
  newFaq.style.borderRadius = "8px";

  newFaq.innerHTML = `
    <div class="settings-group">
      <label>Question #${faqCounter + 1}</label>
      <input type="text" class="settings-input faq-question" data-index="${faqCounter}" value="" placeholder="Enter FAQ question" />
    </div>
    <div class="settings-group">
      <label>Answer #${faqCounter + 1}</label>
      <textarea class="settings-input faq-answer" data-index="${faqCounter}" placeholder="Enter FAQ answer" style="min-height: 80px;"></textarea>
    </div>
    <button type="button" class="btn-2 remove-faq-btn" data-index="${faqCounter}" style="margin-top: 10px;">Remove FAQ</button>
  `;

  // insert before the Add button
  var addBtn = document.getElementById("addFaqBtn");
  container.insertBefore(newFaq, addBtn);

  // attach remove event
  newFaq.querySelector(".remove-faq-btn").onclick = function() {
    newFaq.remove();
  };

  faqCounter++;
};

// attach remove events to existing FAQs
document.querySelectorAll(".remove-faq-btn").forEach(function(btn) {
  btn.onclick = function() {
    btn.closest(".faq-item").remove();
  };
});

// save all FAQs
document.getElementById("saveFaqsBtn").onclick = function() {
  var faqItems = document.querySelectorAll(".faq-item");
  var faqs = [];

  faqItems.forEach(function(item) {
    var question = item.querySelector(".faq-question").value.trim();
    var answer = item.querySelector(".faq-answer").value.trim();

    if (question && answer) {
      faqs.push({
        question: question,
        answer: answer
      });
    }
  });

  fetch("/admin/settings/save-faqs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ faqs: faqs })
  })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data.ok) {
        alert("FAQs saved successfully!");
        location.reload();
      } else {
        alert("Failed to save FAQs");
      }
    })
    .catch(function(err) {
      console.log(err);
      alert("Error saving FAQs");
    });
};

// save store info
document.getElementById("saveStoreBtn").onclick = function() {
  var phone = document.getElementById("storePhone").value.trim();

  fetch("/admin/settings/save-store", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: phone })
  })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data.ok) {
        alert("Store information saved!");
      } else {
        alert("Failed to save store info");
      }
    })
    .catch(function(err) {
      console.log(err);
      alert("Error saving store info");
    });
};
