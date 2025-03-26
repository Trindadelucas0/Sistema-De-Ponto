document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("botao").addEventListener("click", function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

    const usuarioEncontrado = usuarios.find(
      (usuario) => usuario.email === email && usuario.senha === senha
    );

    if (usuarioEncontrado) {
      localStorage.setItem("usuarioAtual", email);

      window.location.href = "/pages/registro-ponto.html";
    } else {
      alert("Login incorreto! Verifique seu e-mail e senha.");
    }
  });
});
