document.addEventListener("DOMContentLoaded", function () {
  const usuarioLogado = localStorage.getItem("usuarioAtual");
  if (!usuarioLogado) {
    alert("Nenhum usuário logado! Faça login primeiro.");
    window.location.href = "/pages/login.html";
    return;
  }

  let registros = JSON.parse(localStorage.getItem("registros")) || {};
  let registrosDoUsuario = registros[usuarioLogado] || [];

  const tabela = document.getElementById("tabela-registros");
  const formEdicao = document.getElementById("form-edicao");
  const editarForm = document.getElementById("editar-form");
  const cancelarEdicaoBtn = document.getElementById("cancelar-edicao");

  let registroEditando = null; // Armazena o índice do registro que está sendo editado
  let campoEditando = null; // Armazena o campo que está sendo editado (data, tipoPonto, hora, foto)

  // Função para exibir os registros na tabela
  function exibirRegistros() {
    tabela.innerHTML = ""; // Limpa a tabela antes de exibir os registros

    if (registrosDoUsuario.length === 0) {
      tabela.innerHTML =
        '<tr><td colspan="5">Nenhum registro encontrado.</td></tr>';
    } else {
      registrosDoUsuario.forEach((registro, index) => {
        const linha = document.createElement("tr");
        linha.innerHTML = `
                    <td>${formatarData(registro.data)}</td>
                    <td>${registro.tipoPonto}</td>
                    <td>${registro.hora}</td>
                    <td>
                        ${
                          registro.foto && registro.foto.length > 0
                            ? registro.foto
                                .map(
                                  (foto, i) => `
                            <img src="${foto}" style="width: 50px;">
                            <a href="${foto}" class="link-baixar" download="foto_${
                                    registro.tipoPonto
                                  }_${i + 1}.jpg">Baixar</a>
                        `
                                )
                                .join("")
                            : "Nenhuma foto"
                        }
                    </td>
                    <td>
                        <button onclick="editarCampo(${index}, 'data')">Editar Data</button>
                        <button onclick="editarCampo(${index}, 'tipoPonto')">Editar Tipo</button>
                        <button onclick="editarCampo(${index}, 'hora')">Editar Horário</button>
                        <button onclick="editarCampo(${index}, 'foto')">Editar Fotos</button>
                        <button onclick="removerRegistro(${index})">Remover</button>
                    </td>
                `;
        tabela.appendChild(linha);
      });
    }
  }

  // Função para editar um campo específico
  window.editarCampo = function (index, campo) {
    registroEditando = index;
    campoEditando = campo;
    const registro = registrosDoUsuario[index];

    // Exibe o formulário de edição e configura o campo correto
    formEdicao.style.display = "block";
    document.getElementById("editar-data-group").style.display =
      campo === "data" ? "block" : "none";
    document.getElementById("editar-tipo-ponto-group").style.display =
      campo === "tipoPonto" ? "block" : "none";
    document.getElementById("editar-hora-group").style.display =
      campo === "hora" ? "block" : "none";
    document.getElementById("editar-foto-group").style.display =
      campo === "foto" ? "block" : "none";

    // Preenche o formulário com os dados atuais
    if (campo === "data") {
      document.getElementById("editar-data").value =
        registro.data.split("T")[0];
    } else if (campo === "tipoPonto") {
      document.getElementById("editar-tipo-ponto").value = registro.tipoPonto;
    } else if (campo === "hora") {
      document.getElementById("editar-hora").value = registro.hora;
    }
  };

  // Função para salvar as alterações do campo editado
  editarForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (campoEditando === "data") {
      registrosDoUsuario[registroEditando].data =
        document.getElementById("editar-data").value;
    } else if (campoEditando === "tipoPonto") {
      registrosDoUsuario[registroEditando].tipoPonto =
        document.getElementById("editar-tipo-ponto").value;
    } else if (campoEditando === "hora") {
      registrosDoUsuario[registroEditando].hora =
        document.getElementById("editar-hora").value;
    } else if (campoEditando === "foto") {
      const novasFotos = document.getElementById("editar-foto").files;
      if (novasFotos.length > 0) {
        const novasFotosBase64 = [];
        Array.from(novasFotos).forEach((file) => {
          const reader = new FileReader();
          reader.onload = function (event) {
            novasFotosBase64.push(event.target.result);
            if (novasFotosBase64.length === novasFotos.length) {
              registrosDoUsuario[registroEditando].foto = novasFotosBase64;
              salvarRegistros();
            }
          };
          reader.readAsDataURL(file);
        });
      }
    }

    salvarRegistros();
    formEdicao.style.display = "none";
    exibirRegistros();
  });

  // Função para cancelar a edição
  cancelarEdicaoBtn.addEventListener("click", function () {
    formEdicao.style.display = "none";
    registroEditando = null;
    campoEditando = null;
  });

  // Função para remover um registro
  window.removerRegistro = function (index) {
    if (confirm("Tem certeza que deseja remover este registro?")) {
      registrosDoUsuario.splice(index, 1);
      salvarRegistros();
      exibirRegistros();
    }
  };

  // Função para salvar os registros no localStorage
  function salvarRegistros() {
    registros[usuarioLogado] = registrosDoUsuario;
    localStorage.setItem("registros", JSON.stringify(registros));
  }

  function formatarData(data) {
    // Caso a data já esteja formatada (ex: "segunda-feira, 03/04/2023")
    if (typeof data !== "string" || data.includes(",")) {
      return data;
    }

    // Remove possíveis horas/timezone se existirem (ex: "2023-04-03T00:00:00")
    const dataLimpa = data.split("T")[0];

    // Verifica formato YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dataLimpa)) {
      const [ano, mes, dia] = dataLimpa.split("-");

      // Cria a data com tratamento UTC EXPLÍCITO (solução definitiva)
      const dataObj = new Date(Date.UTC(ano, mes - 1, dia));

      // Formatação à prova de erros
      try {
        return dataObj.toLocaleDateString("pt-BR", {
          weekday: "long",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          timeZone: "America/Sao_Paulo", // Ou seu fuso específico
        });
      } catch (e) {
        console.error("Erro ao formatar data:", e);
        return dataLimpa; // Retorna no formato original se falhar
      }
    }

    // Se não for YYYY-MM-DD, retorna sem formatação
    return data;
  }

  // Exibe os registros ao carregar a página
  exibirRegistros();

  // Restante do código para calcular horas trabalhadas...
  // Função para calcular as horas trabalhadas, extras e faltantes
  document
    .getElementById("calcular-horas")
    .addEventListener("click", function () {
      const cargaHorariaDiaria = document
        .getElementById("carga-horaria")
        .value.trim();
      if (!cargaHorariaDiaria) {
        alert("Por favor, insira a carga horária diária.");
        return;
      }

      const [cargaHorariaHora, cargaHorariaMinuto] = cargaHorariaDiaria
        .split(":")
        .map(Number);
      const cargaHorariaTotal = cargaHorariaHora * 60 + cargaHorariaMinuto; // Convertendo para minutos

      const registrosDoDia = agruparRegistrosPorData(registrosDoUsuario);
      const resultados = calcularHorasTrabalhadas(
        registrosDoDia,
        cargaHorariaTotal
      );

      // Exibe os resultados
      document.getElementById("horas-trabalhadas").textContent =
        resultados.horasTrabalhadas;
      document.getElementById("horas-extras").textContent =
        resultados.horasExtras;
      document.getElementById("horas-faltantes").textContent =
        resultados.horasFaltantes;
    });

  // Função para agrupar registros por data
  function agruparRegistrosPorData(registros) {
    const registrosPorData = {};
    registros.forEach((registro) => {
      if (!registrosPorData[registro.data]) {
        registrosPorData[registro.data] = [];
      }
      registrosPorData[registro.data].push(registro);
    });
    return registrosPorData;
  }

  // Função para calcular horas trabalhadas, extras e faltantes
  function calcularHorasTrabalhadas(registrosPorData, cargaHorariaTotal) {
    let totalHorasTrabalhadas = 0;
    let totalHorasExtras = 0;
    let totalHorasFaltantes = 0;

    Object.keys(registrosPorData).forEach((data) => {
      const registrosDoDia = registrosPorData[data];
      const horasDoDia = calcularHorasDoDia(registrosDoDia);

      if (horasDoDia > cargaHorariaTotal) {
        totalHorasExtras += horasDoDia - cargaHorariaTotal;
      } else if (horasDoDia < cargaHorariaTotal) {
        totalHorasFaltantes += cargaHorariaTotal - horasDoDia;
      }

      totalHorasTrabalhadas += horasDoDia;
    });

    return {
      horasTrabalhadas: formatarHoras(totalHorasTrabalhadas),
      horasExtras: formatarHoras(totalHorasExtras),
      horasFaltantes: formatarHoras(totalHorasFaltantes),
    };
  }

  // Função para calcular as horas trabalhadas em um dia
  function calcularHorasDoDia(registrosDoDia) {
    let totalMinutos = 0;
    let ultimoTipo = "";
    let ultimaHora = "";

    registrosDoDia
      .sort((a, b) => a.hora.localeCompare(b.hora))
      .forEach((registro) => {
        if (ultimoTipo === "entrada" && registro.tipoPonto === "almoco") {
          const [horaInicio, minutoInicio] = ultimaHora.split(":").map(Number);
          const [horaFim, minutoFim] = registro.hora.split(":").map(Number);
          totalMinutos +=
            (horaFim - horaInicio) * 60 + (minutoFim - minutoInicio);
        }
        if (ultimoTipo === "retorno" && registro.tipoPonto === "saida") {
          const [horaInicio, minutoInicio] = ultimaHora.split(":").map(Number);
          const [horaFim, minutoFim] = registro.hora.split(":").map(Number);
          totalMinutos +=
            (horaFim - horaInicio) * 60 + (minutoFim - minutoInicio);
        }
        ultimoTipo = registro.tipoPonto;
        ultimaHora = registro.hora;
      });

    return totalMinutos;
  }

  // Função para formatar minutos no formato HH:MM
  function formatarHoras(minutos) {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${String(horas).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  }
});

// Função para gerar PDF
window.gerarPDF = function () {
  const usuarioLogado = localStorage.getItem("usuarioAtual");
  if (!usuarioLogado) {
    alert("Nenhum usuário logado! Faça login primeiro.");
    return;
  }

  const registros = JSON.parse(localStorage.getItem("registros")) || {};
  const registrosDoUsuario = registros[usuarioLogado] || [];

  if (registrosDoUsuario.length === 0) {
    alert("Nenhum registro encontrado!");
    return;
  }

  // Cria um novo documento PDF
  const doc = new jspdf.jsPDF();

  // Adiciona um título ao PDF
  doc.setFontSize(18);
  doc.text("Relatório de Registros de Ponto", 10, 10);

  let y = 30; // Posição vertical inicial

  // 1. Adiciona os registros ao PDF
  registrosDoUsuario.forEach((registro, index) => {
    // Adiciona os dados do registro
    doc.setFontSize(12);
    doc.text(`Registro ${index + 1}:`, 10, y);
    y += 10;

    doc.text(`Data: ${registro.data}`, 10, y);
    y += 10;

    doc.text(`Tipo de Ponto: ${registro.tipoPonto}`, 10, y);
    y += 10;

    doc.text(`Horário: ${registro.hora}`, 10, y);
    y += 20;

    // Verifica se precisa de uma nova página para o próximo registro
    if (y > doc.internal.pageSize.height - 20) {
      doc.addPage(); // Adiciona uma nova página
      y = 20; // Reinicia a posição vertical
    }
  });

  // 2. Adiciona as fotos em páginas separadas
  registrosDoUsuario.forEach((registro, index) => {
    if (registro.foto && registro.foto.length > 0) {
      registro.foto.forEach((foto, i) => {
        // Adiciona uma nova página para cada foto
        doc.addPage();

        // Adiciona o título da foto
        doc.setFontSize(14);
        doc.text(`Foto do Registro ${index + 1} - Foto ${i + 1}`, 10, 20);

        // Converte a foto (Base64) em uma imagem e adiciona ao PDF
        const img = new Image();
        img.src = foto;

        // Calcula o tamanho da imagem para caber na página
        const imgWidth = 150; // Largura fixa para a imagem
        const imgHeight = (img.naturalHeight / img.naturalWidth) * imgWidth; // Mantém a proporção

        // Adiciona a imagem ao PDF
        doc.addImage(foto, "JPEG", 10, 30, imgWidth, imgHeight);

        // Adiciona um link para baixar a foto
        doc.text(`Baixar foto ${i + 1}`, 10, 30 + imgHeight + 10);
        doc.link(10, 30 + imgHeight + 5, 50, 10, { url: foto }); // Link para a foto
      });
    }
  });

  // Salva o PDF
  doc.save("relatorio-registros.pdf");
};
// Navegar para a página de registros
document.getElementById("Voltar").addEventListener("click", function () {
  window.location.href = "/pages/registro-ponto.html"; // Vai para a página de visualização dos registros
});
