function send() {
  let input = document.getElementById("input");
  let chat = document.getElementById("chat");

  let msg = input.value.trim().toLowerCase();

  if (msg === "") return; // empty stop

  let reply = "🤖 I am learning...";

  // SMART RESPONSES
  if (msg.includes("hello") || msg.includes("hi")) {
    reply = "👋 Hello! Welcome to Siam AI Portfolio";
  }
  else if (msg.includes("how are you")) {
    reply = "😊 I'm just code, but I'm working perfectly!";
  }
  else if (msg.includes("your name")) {
    reply = "🤖 I am Siam AI Bot";
  }
  else if (msg.includes("ai")) {
    reply = "🌍 AI is the future of humanity!";
  }
  else if (msg.includes("ml") || msg.includes("machine learning")) {
    reply = "🔥 Machine Learning is changing the world!";
  }
  else if (msg.includes("data")) {
    reply = "📊 Data is the new oil!";
  }
  else if (msg.includes("bye")) {
    reply = "👋 Bye! Keep learning and building!";
  }

  // SHOW CHAT
  chat.innerHTML += `
    <p><b>You:</b> ${input.value}</p>
    <p><b>Bot:</b> ${reply}</p>
  `;

  // CLEAR INPUT
  input.value = "";

  // AUTO SCROLL
  chat.scrollTop = chat.scrollHeight;
}