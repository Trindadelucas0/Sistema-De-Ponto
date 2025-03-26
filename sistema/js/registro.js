document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("ponto-form")
    .addEventListener("submit", function (event) {
      event.preventDefault();

      const usuarioLogado = localStorage.getItem("usuarioAtual");
      if (!usuarioLogado) {
        alert("Nenhum usuário logado! Faça login primeiro.");
        return;
      }
      const nome = document.getElementById("nome").value.trim();

      function formatarData(data) {
        const [ano, mes, dia] = data.split("-");
        const dataObj = new Date(`${ano}-${mes}-${dia}T00:00:00`);
        const opcoes = {
          weekday: "long",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        };
        return dataObj.toLocaleDateString("pt-BR", opcoes);
      }
      const data = formatarData(document.getElementById("data").value.trim());

      const tipoPonto = document.getElementById("tipo-ponto").value.trim();
      const hora = document.getElementById("hora").value.trim();
      const foto = document.getElementById("foto").files;

      if (!data || !tipoPonto || !hora || foto.length === 0) {
        alert("Preencha todos os campos e selecione ao menos uma foto!");
        return;
      }

      const confirmar = confirm(`${nome} Deseja prosseguir com os dados? 
            Data: ${data}
            Tipo de Ponto: ${tipoPonto}
            Horário: ${hora} `);
      if (!confirmar) {
        alert(`REGISTRO CANCELADO!
                    TENTE NOVAMENTE!`);
      }

      let registros = JSON.parse(localStorage.getItem("registros")) || {};
      if (!registros[usuarioLogado]) {
        registros[usuarioLogado] = [];
      }
      const fotoBase64 = [];
      Array.from(foto).forEach((file) => {
        const reader = new FileReader();
        reader.onload = function (event) {
          fotoBase64.push(event.target.result);

          if (fotoBase64.length === foto.length) {
            const novoRegistro = { data, tipoPonto, hora, foto: fotoBase64 };
            registros[usuarioLogado].push(novoRegistro);
            localStorage.setItem("registros", JSON.stringify(registros));

            alert("Ponto registrado com sucesso!");
            // Redireciona para a página de registros após o registro do ponto
            window.location.href = "/pages/ver-registros.html";
          }
        };
        reader.readAsDataURL(file); // Lê a foto como base64
      });
    });

  // Navegar para a página de registros
  document
    .getElementById("ver-registros-btn")
    .addEventListener("click", function () {
      window.location.href = "/pages/ver-registros.html"; // Vai para a página de visualização dos registros
    });
});
