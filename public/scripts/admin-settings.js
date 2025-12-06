let faqCounter = document.querySelectorAll(".faq-item").length;

document.getElementById("addFaqBtn").onclick = function () {
  let container = document.getElementById("faqContainer");

  let newFaq = document.createElement("div");
  newFaq.className = "faq-item";

  newFaq.innerHTML = `
    <div class="settings-group">
      <label>Question #${faqCounter + 1}</label>
      <input 
        type="text" 
        class="settings-input"
        name="question[]"
        required
      />
    </div>

    <div class="settings-group">
      <label>Answer #${faqCounter + 1}</label>
      <textarea 
        class="settings-input"
        name="answer[]"
        required
      ></textarea>
    </div>
  `;

  container.appendChild(newFaq);

  faqCounter++;
};
