document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("botao-cadastro")
    .addEventListener("click", function (event) {
      event.preventDefault();

      const nome = document.getElementById("nome").value;
      const email = document.getElementById("email").value;
      const senha = document.getElementById("senha").value;
      const erro = document.getElementById("erro");

      if (!nome || !email || !senha) {
        alert("Por favor, preencha todos os campos!");
        return;
      }

      let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

      const emailExistente = usuarios.some(
        (usuario) => usuario.email === email
      );
      if (emailExistente) {
        alert("Este e-mail já está cadastrado!");
        return;
      }

      const novoUsuario = { nome, email, senha };
      usuarios.push(novoUsuario);

      localStorage.setItem("usuarios", JSON.stringify(usuarios));

      alert("Usuário cadastrado com sucesso!");
      window.location.href = "/sistema/pages/login.html";
    });
});
