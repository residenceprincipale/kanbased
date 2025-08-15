document.addEventListener("DOMContentLoaded", function () {
  const nav = document.querySelector(".nav");
  const footerScrolledPosition = 5498;

  function onScroll() {
    if (window.scrollY > footerScrolledPosition) {
      nav.classList.add("footer-touched");
      nav.classList.remove("scrolled");
    } else if (window.scrollY > 20) {
      nav.classList.add("scrolled");
      nav.classList.remove("footer-touched");
    } else {
      nav.classList.remove("scrolled");
      nav.classList.remove("footer-touched");
    }
  }

  window.addEventListener("scroll", onScroll);

  const year = document.getElementById("year");
  year.textContent = new Date().getFullYear();
});
