
var form = document.querySelector("form");

form.addEventListener("submit", (e) => submitForm(e));

var submitForm = (e) => {
e.preventDefault();
const username = e.target[0].value;
const password = e.target[1].value;

var options = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    redirect: "follow",
    body: JSON.stringify({ username: username, password: password }),
};
username && password
    ? fetch("/admin/login", options)
        .then((res) => {
        if (res.status === 200) {
            return res.json();
        } else {
            return new Error("HMMMMMMMMMM");
        }
        })
        .then((data) => {
        data && data.redirect ? window.location.href = data.redirect :console.error
        })
        .catch(console.error)
    : console.log("fuck you");
};

sessionStorage.clear();