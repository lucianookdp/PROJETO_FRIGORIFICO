import React, { useEffect, useState } from "react";
import { FaPlus, FaClipboardList, FaEdit, FaTrash } from "react-icons/fa";
import AdminHeader from "../components/AdminHeader";
import api, { API_BASE } from "../api/api";
import ProdutoModal from "../components/ProdutoModal";
import "../styles/AdminDashboard.css";
import "../styles/ModalAdicionarProduto.css";

const AdminDashboard = () => {
  const [produtos, setProdutos] = useState([]);
  const [erro, setErro] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valorKg, setValorKg] = useState("");
  const [foto, setFoto] = useState(null);

  useEffect(() => {
    buscarProdutos();
  }, []);

  const buscarProdutos = async () => {
    try {
      const response = await api.get("/produtos");
      setProdutos(response.data);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      setErro("Erro ao carregar produtos.");
    }
  };

  const salvarProduto = async () => {
    if (!titulo || !descricao || !valorKg || (!foto && !editandoId)) {
      alert("Preencha todos os campos e selecione uma imagem.");
      return;
    }

    const formData = new FormData();
    formData.append("titulo", titulo);
    formData.append("descricao", descricao);
    formData.append("valorKg", valorKg);

    if (foto) {
      formData.append("foto", foto);
    } else if (editandoId) {
      const produtoAtual = produtos.find((p) => p.id === editandoId);
      if (produtoAtual?.foto) {
        formData.append("foto", produtoAtual.foto); // foto antiga
      }
    }

    try {
      const response = editandoId
        ? await api.put(`/produtos/${editandoId}`, formData)
        : await api.post("/produtos", formData);

      if (response.status === 200 || response.status === 201) {
        limparFormulario();
        buscarProdutos();
      } else {
        alert(response.data?.message || "Erro ao salvar produto.");
      }
    } catch (error) {
      console.error("❌ Erro ao salvar produto:", error);
      alert(
        error?.response?.data?.message ||
          "Erro ao salvar produto. Verifique os dados e tente novamente."
      );
    }
  };

  const removerProduto = async (id) => {
    try {
      await api.delete(`/produtos/${id}`);
      buscarProdutos();
    } catch (error) {
      console.error("Erro ao remover produto:", error);
      alert("Erro ao remover produto.");
    }
  };

  const editarProduto = (produto) => {
    setTitulo(produto.titulo);
    setDescricao(produto.descricao);
    setValorKg(produto.valorKg);
    setFoto(null); // não preenche nova imagem por padrão
    setEditandoId(produto.id);
    setMostrarFormulario(true);
  };

  const limparFormulario = () => {
    setTitulo("");
    setDescricao("");
    setValorKg("");
    setFoto(null);
    setEditandoId(null);
    setMostrarFormulario(false);
  };

  const verLogs = () => {
    window.location.href = "/admin/orcamentos";
  };

  const alternarDestaque = async (produtoId, valorAtual) => {
    const totalDestaques = produtos.filter((p) => p.destaque).length;

    if (!valorAtual && totalDestaques >= 4) {
      alert("Você só pode ter no máximo 4 produtos em destaque.");
      return;
    }

    try {
      await api.patch(`/produtos/${produtoId}/destaque`, {
        destaque: !valorAtual,
      });
      buscarProdutos();
    } catch (error) {
      console.error("Erro ao alterar destaque:", error);
      alert("Erro ao alterar destaque.");
    }
  };

  return (
    <>
      <AdminHeader onLogout={() => (window.location.href = "/")} />

      <div className="produtos-container" style={{ paddingTop: "140px" }}>
        <div className="topo-painel">
          <button className="btn-adicionar" onClick={() => setMostrarFormulario(true)}>
            <FaPlus /> Adicionar Novo Produto
          </button>
          <button className="btn-logs" onClick={verLogs}>
            <FaClipboardList /> Ver Logs de Orçamentos
          </button>
        </div>

        {erro && (
          <p className="erro" style={{ textAlign: "center", color: "red" }}>
            {erro}
          </p>
        )}

        <table className="tabela-produtos">
          <thead>
            <tr>
              <th>IMG</th>
              <th>TÍTULO</th>
              <th>DESCRIÇÃO</th>
              <th>VALOR (KG)</th>
              <th>AÇÃO</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((p) => (
              <tr key={p.id}>
                <td>
                  <img
                    src={`${API_BASE}${p.foto}`}
                    alt="Produto"
                    className="imagem-produto"
                  />
                </td>
                <td className="coluna-titulo">{p.titulo}</td>
                <td className="coluna-descricao">{p.descricao}</td>
                <td className="coluna-valor">{Number(p.valorKg).toFixed(2)} R$</td>
                <td className="coluna-acoes">
                  <div className="botoes-wrapper">
                    <button className="btn-editar" onClick={() => editarProduto(p)}>
                      <FaEdit /> Editar
                    </button>
                    <button className="btn-remover" onClick={() => removerProduto(p.id)}>
                      <FaTrash /> Remover
                    </button>
                    <button
                      className={`btn-destaque ${p.destaque ? "ativo" : ""}`}
                      onClick={() => alternarDestaque(p.id, p.destaque)}
                    >
                      {p.destaque ? "Remover Destaque" : "Adicionar Destaque"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {mostrarFormulario && (
        <ProdutoModal
          editandoId={editandoId}
          titulo={titulo}
          descricao={descricao}
          valorKg={valorKg}
          setTitulo={setTitulo}
          setDescricao={setDescricao}
          setValorKg={setValorKg}
          setFoto={setFoto}
          onSalvar={salvarProduto}
          onCancelar={limparFormulario}
        />
      )}
    </>
  );
};

export default AdminDashboard;
