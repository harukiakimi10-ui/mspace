(function () {
  function init() {
    var button = document.getElementById("test-button");
    var counter = document.getElementById("counter");
    var count = 0;

    if (!button || !counter) return;

    button.addEventListener("click", function () {
      count += 1;
      counter.textContent = String(count);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();