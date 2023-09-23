const login_form = document.getElementById("login_form");
Socket = io();

login_form.addEventListener("submit", (e) => {
  e.preventDefault();
  let userLogin = Object.fromEntries(new FormData(e.target));
  console.log(userLogin);
  e.target.reset();
  fetch("/api/sessions/login", {
    method: "POST",
    body: userLogin,
  });
});
