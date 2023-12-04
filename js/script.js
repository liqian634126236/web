document.addEventListener("DOMContentLoaded", function () {
  var draggables = document.querySelectorAll(".draggable");
  var isDragging = false;
  var offsetX, offsetY, selectedElement;

  function handleMouseDown(e) {
    isDragging = true;
    selectedElement = e.currentTarget;
    offsetX = e.clientX - selectedElement.getBoundingClientRect().left;
    offsetY = e.clientY - selectedElement.getBoundingClientRect().top;

    // Prevent text selection during dragging
    e.preventDefault();
  }

  function handleMouseMove(e) {
    if (isDragging && selectedElement) {
      var x = e.clientX - offsetX;
      var y = e.clientY - offsetY;

      // Ensure the element stays within the viewport
      var maxX =
        document.documentElement.clientWidth - selectedElement.clientWidth;
      var maxY =
        document.documentElement.clientHeight - selectedElement.clientHeight;

      x = Math.min(Math.max(0, x), maxX);
      y = Math.min(Math.max(0, y), maxY);

      selectedElement.style.left = x + "px";
      selectedElement.style.top = y + "px";
    }
  }

  function handleMouseUp() {
    isDragging = false;
    selectedElement = null;
  }

  draggables.forEach(function (draggable) {
    draggable.addEventListener("mousedown", handleMouseDown);
  });

  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);

  // Handle the mouse leaving the viewport while dragging
  document.addEventListener("mouseleave", function () {
    if (isDragging) {
      isDragging = false;
      selectedElement = null;
    }
  });
});
