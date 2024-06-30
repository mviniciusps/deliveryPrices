// Dados fornecidos pelo usuario
class Endereco {

    constructor(rua, bairro, cidades, taxa, opcao) {
        this.rua = rua;
        this.bairro = bairro;
        this.cidades = cidades;
        this.taxa = taxa;
        this.opcao = opcao;
    }

    validarCampos() {
        for (let i in this) {
            if (this[i] == undefined || this[i] == "" || this[i] == null) {
                return false;
            }
        }
        return true;
    }
}
// FIM -----------------------------------


// Classe com CRUD
class BancoDeDados {

    //criar um id inicial
    constructor() {
        let id = localStorage.getItem('id');
        if (id === null) {
            localStorage.setItem('id', 0);
        }
    }

    // id ordem crescente
    getProximoId() {
        let proximoId = localStorage.getItem('id');
        return parseInt(proximoId) + 1;
    }

    // create
    gravar(endereco) {
        let id = this.getProximoId();
        localStorage.setItem(id, JSON.stringify(endereco));
        localStorage.setItem('id', id);
    }

    // read
    recuperarRegistros() {

        let registroArray = Array();
        let id = localStorage.getItem('id');

        for (let i = 1; i <= id; i++) {
            let registro = JSON.parse(localStorage.getItem(i));
            //pular indice fora da sequencia
            if (registro === null) {
                continue;
            }
            registro.id = i;
            registroArray.push(registro);
        }
        return registroArray;
    }

    // delete
    remover(id) {
        localStorage.removeItem(id);
    }

    removerTodos() {
        localStorage.clear();
    }

    // update
    atualizar(id) {

        $('#atualizaGravacao').modal('show');

        let registro = JSON.parse(localStorage.getItem(id));
        document.getElementById('ruaAtualiza').value = registro.rua;
        document.getElementById('bairroAtualiza').value = registro.bairro;
        document.getElementById('cidadesAtualiza').value = registro.cidades;
        document.getElementById('taxaAtualiza').value = registro.taxa;
        let opcoes = document.querySelectorAll('input[name="opcaoAtualiza"]');

        opcoes.forEach(opcao => {
            if (opcao.value === registro.opcao) {
                opcao.checked = true;
            } else {
                opcao.checked = false;
            }
        });

        document.getElementById('atualiza').onclick = function () {
            let rua = document.getElementById('ruaAtualiza').value;
            let bairro = document.getElementById('bairroAtualiza').value;
            let cidades = document.getElementById('cidadesAtualiza').value;
            let taxa = document.getElementById('taxaAtualiza').value;
            let opcao = document.querySelector('input[name="opcaoAtualiza"]:checked').value;

            let enderecoAtualizado = new Endereco(rua, bairro, cidades, taxa, opcao);

            if (enderecoAtualizado.validarCampos()) {
                localStorage.setItem(id, JSON.stringify(enderecoAtualizado));
                window.location.reload();
            } else {
                document.getElementById('msg_erro').innerHTML = 'Atenção! Há campos vazios';
            }
        }
    }
}
// FIM -----------------------------------


// Instancia para utilzar os métodos com os dados do localstorage
let bancoDeDados = new BancoDeDados();


// Recupera os dados do formulario
function cadastrarCorrida() {

    let rua = document.getElementById('rua').value;
    let bairro = document.getElementById('bairro').value;
    let cidades = document.getElementById('cidades').value;
    let taxa = document.getElementById('taxa').value;
    let opcao = document.querySelector('input[name="opcao"]:checked').value;

    let endereco = new Endereco(rua, bairro, cidades, taxa, opcao);

    if (endereco.validarCampos()) {
        bancoDeDados.gravar(endereco);
        window.location.reload();

    } else {
        document.getElementById('modal_titulo').innerHTML = 'Atenção!';
        document.getElementById('modal_css').className = 'modal-header text-danger';
        document.getElementById('modal_texto').innerHTML = 'Há campos vazios!';
        document.getElementById('modal_botao').innerHTML = 'Voltar';
        document.getElementById('modal_botao').className = 'btn btn-danger';

        //Mudar para JS puro
        $('#erroGravacao').modal('show');
    }
}
// FIM -----------------------------------

var totalRepasse = 0;

// Exibir dados no body
function carregaComandas() {


    registroArray = bancoDeDados.recuperarRegistros();
    var listaComandas = document.getElementById('listaTabela');

    // ordena de forma decrescente antes de exibir
    registroArray.sort((a, b) => b.id - a.id);

    // percorre e exibe todos dados do localstorage
    registroArray.forEach(registro => {

        let ordenar = Array(registro.id);

        ordenar.sort((a, b) => {
            return a - b;
        });

        //(tr)
        let linha = listaComandas.insertRow();

        //(td)
        linha.insertCell(0).innerHTML = registro.rua;
        linha.insertCell(1).innerHTML = registro.bairro;

        switch (registro.cidades) {
            case '1': registro.cidades = "São Vicente";
                break;
            case '2': registro.cidades = "Santos";
                break;
            case '3': registro.cidades = "Praia Grande";
                break;
        }

        linha.insertCell(2).innerHTML = registro.cidades;
        linha.insertCell(3).innerHTML = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(registro.taxa));

        let repasse;
        let registroTaxa = parseFloat(registro.taxa);

        if (registro.opcao === 'repasse') {
            if ((registroTaxa) > 10) {
                repasse = registroTaxa - 3;
            } else if (registroTaxa == 0) {
                repasse = 2;
            } else {
                repasse = registroTaxa - 2;
            }
        } else {
            repasse = registroTaxa;
        }

        linha.insertCell(4).innerHTML = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(repasse);

        totalRepasse += repasse;

        let botaoExcluir = document.createElement('button');
        botaoExcluir.className = 'btn bg-muted btn mb-0';
        botaoExcluir.innerHTML = '<i class="fa-sharp fa-solid fa-delete-left text-danger"></i>';

        botaoExcluir.onclick = () => {

            document.getElementById('modal_tituloErro').innerHTML = 'Atenção!';
            document.getElementById('modal_cssErro').className = 'modal-header text-danger';
            document.getElementById('modal_textoErro').innerHTML = `Deseja realmente excluir ${registro.rua}?`;

            //Mudar para JS puro
            $('#excluir').modal('show');

            document.getElementById('modal_botaoSim').onclick = () => {
                bancoDeDados.remover(registro.id);
                window.location.reload();
            }

        }

        let botaoEditar = document.createElement('button');
        botaoEditar.className = 'btn bg-muted btn mb-0';
        botaoEditar.innerHTML = '<i class="fa-sharp fa-solid fa-pen-to-square text-warning"></i>';

        botaoEditar.onclick = () => {
            bancoDeDados.atualizar(registro.id);
        }

        let botoesTd = linha.insertCell(5);

        botoesTd.style.whiteSpace = 'nowrap';
        botoesTd.appendChild(botaoExcluir);
        botoesTd.appendChild(botaoEditar);

    });

    if (registroArray.length > 0) {
        document.getElementById('totalRepasse').innerHTML = `Repasse: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRepasse)}`;
        document.getElementById('botaoFinalizar').innerHTML = '<button type="button" class="btn btn-success me-2" onclick="finalizarCorridas()"><i class="fa-solid fa-check"></i></button><button type="button" onclick="removerTodos()" class="btn btn-danger me-2"><i class="fa-solid fa-trash-can"></i></button><button type="button" onclick="downloadPDF()" class="btn btn-info icon-white"><i style="color: white;" class="fa-solid fa-circle-arrow-down fa-1x"></i></button>';

        const hr = document.getElementsByTagName('hr');
        for (let i = 0; i < hr.length; i++) {
            hr[i].style.display = 'block';
        }

    } else {
        document.getElementById('totalRepasse').innerHTML = "";

        const hr = document.getElementsByTagName('hr');

        for (let i = 0; i < hr.length; i++) {
            hr[i].style.display = 'none';
        }

        document.getElementById('tabelaValor').style.display = 'none';
    }

    if (registroArray.length == 1) {
        document.getElementById('totalEntregas').innerHTML = `Total de ${registroArray.length} entrega`;
    } else if (registroArray.length > 1) {
        document.getElementById('totalEntregas').innerHTML = `Total de ${registroArray.length} entregas`;
    } else {
        document.getElementById('totalEntregas').innerHTML = ""
    }
}

function downloadPDF() {
    const tabela = document.getElementById('conteudoParaImprimir');
    let dataAtual = new Date()
    var opt = {
        margin: 1,
        filename: `comanda-${dataAtual.getDate()}/${dataAtual.getMonth() + 1}/${dataAtual.getFullYear()}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    html2pdf().set(opt).from(tabela).save();
}

function finalizarCorridas() {

    document.getElementById('modal_cssErro').className = 'modal-header text-success';
    document.getElementById('modal_textoErro').innerHTML = 'Deseja finalizar?';
    document.getElementById('modal_botaoSim').className = 'btn btn-success';

    //Mudar para JS puro
    $('#excluir').modal('show');

    document.getElementById('modal_botaoSim').onclick = () => {
        document.getElementById('modal_textoErro').innerHTML = 'Qual a paga do dia? <b>';
        let input = document.createElement('input');
        input.type = 'number';
        input.id = 'input';
        document.getElementById('modal_textoErro').appendChild(input);
        document.getElementById('modal_botaoSim').innerHTML = 'Confirmar';


        document.getElementById('modal_botaoSim').onclick = () => {
            let valorPaga = parseFloat(document.getElementById('input').value);
            document.getElementById('totalRepasse').innerHTML = `Paga de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorPaga)} + ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRepasse)}<br>Totalizando: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorPaga + totalRepasse)}`;

            $('#excluir').modal('hide');

        }

    }

}

function removerTodos() {

    document.getElementById('modal_tituloErro').innerHTML = 'Atenção!';
    document.getElementById('modal_cssErro').className = 'modal-header text-danger';
    document.getElementById('modal_textoErro').innerHTML = 'Deseja realmente excluir todos os registros?';
    document.getElementById('modal_botaoSim').className = 'btn btn-danger';

    //Mudar para JS puro
    $('#excluir').modal('show');

    document.getElementById('modal_botaoSim').onclick = () => {
        bancoDeDados.removerTodos();
        window.location.reload();
    }
}
// FIM -----------------------------------