(function () {
  "use strict";

  var FORMSPREE_ID = "YOUR_FORM_ID";

  /* Header scroll state */
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Scroll reveal */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );
    reveals.forEach(function (el) {
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* Interest form */
  var form = document.getElementById("interest-form");
  var statusEl = document.getElementById("form-status");
  var submitBtn = document.getElementById("submit-btn");

  function setStatus(message, kind) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.classList.remove("is-success", "is-error", "is-setup");
    if (kind) statusEl.classList.add("is-" + kind);
  }

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        setStatus("Please fill in the required fields.", "error");
        return;
      }

      if (!FORMSPREE_ID || FORMSPREE_ID === "YOUR_FORM_ID") {
        setStatus(
          "Form preview ready. Create a free form at formspree.io and replace YOUR_FORM_ID in assets/js/main.js to receive submissions.",
          "setup"
        );
        return;
      }

      submitBtn.disabled = true;
      setStatus("Sending…", null);

      var endpoint = "https://formspree.io/f/" + FORMSPREE_ID;
      var data = new FormData(form);

      fetch(endpoint, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      })
        .then(function (res) {
          if (res.ok) {
            form.reset();
            setStatus("Thanks — we’ll be in touch about what you’d like to count.", "success");
            return;
          }
          return res.json().then(function (body) {
            var msg =
              (body && body.errors && body.errors[0] && body.errors[0].message) ||
              "Something went wrong. Please try again.";
            throw new Error(msg);
          });
        })
        .catch(function (err) {
          setStatus(err.message || "Network error. Please try again.", "error");
        })
        .finally(function () {
          submitBtn.disabled = false;
        });
    });
  }
})();
