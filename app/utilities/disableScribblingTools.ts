export function disableScribblingTools() {
  const canvas = document.querySelector("canvas");
  if (canvas) {
    canvas.style.pointerEvents = "none";
  }

  const message = document.createElement("div");
  message.textContent = "Login to start Scribbling!";
  message.className =
    "fixed top-4 left-4 bg-red-500 text-white px-4 py-2 rounded shadow-md z-50";
  document.body.appendChild(message);
}
