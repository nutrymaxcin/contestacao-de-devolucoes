import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://iorkgxlmiaencdqbsppr.supabase.co";
const supabaseAnonKey = "sb_publishable_cEVEPZKra-SUlLrt41BwkQ_yUeJDrlJ";
const supabase = createClient(supabaseUrl, supabaseAnonKey);


const MOTIVOS_ORIGINAIS = [
  "Cliente desistiu da compra",
  "Erro de digitação",
  "Pedido duplicado",
];

const STATUS = {
  PENDENTE: "Pendente",
  APROVADO: "Aprovado",
  NEGADO: "Negado",
};

const STATUS_COLORS = {
  Pendente: { bg: "#F3E7CC", text: "#8A5A12", border: "#C98A2C" },
  Aprovado: { bg: "#DEE9E1", text: "#2F5240", border: "#3F6B4F" },
  Negado: { bg: "#F0DAD6", text: "#7E2A20", border: "#B0362C" },
};

function uid() {
  return "CT-" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }) +
    " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function StatusStamp({ status }) {
  const c = STATUS_COLORS[status];
  return (
    <span
      style={{
        display: "inline-block",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "11px",
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: c.text,
        background: c.bg,
        border: `1.5px solid ${c.border}`,
        borderRadius: "3px",
        padding: "3px 8px",
        transform: status === "Pendente" ? "rotate(0deg)" : "rotate(-2deg)",
      }}
    >
      {status}
    </span>
  );
}

function TicketCard({ item, isCoordenadora, onUpdate, onDelete }) {
  const [showReview, setShowReview] = useState(false);
  const [retorno, setRetorno] = useState(item.retorno || "");

  const decide = (novoStatus) => {
    onUpdate(item.id, { status: novoStatus, retorno, decididoEm: new Date().toISOString() });
    setShowReview(false);
  };

  return (
    <div
      style={{
        background: "#FBF9F4",
        border: "1px solid #D8D0BE",
        borderRadius: "6px",
        position: "relative",
        overflow: "hidden",
        padding: "22px 24px",
        marginBottom: "18px",
      }}
      className="shadow-sm"
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "6px",
          background: STATUS_COLORS[item.status].border,
        }}
      />
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "#8A8272" }}>
              {item.id} · {formatDate(item.criadoEm)}
            </div>
            <div style={{ fontWeight: 700, color: "#20303D", fontSize: "16px", marginTop: "4px" }}>
              {item.cliente}
            </div>
          </div>
          <StatusStamp status={item.status} />
        </div>
        {isCoordenadora && onDelete && (
          <div className="flex justify-end mb-3">
            <button
              onClick={() => onDelete(item.id)}
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "11px",
                fontWeight: 700,
                color: "#B0362C",
                background: "transparent",
                border: "1px solid #B0362C",
                borderRadius: "4px",
                padding: "6px 10px",
                cursor: "pointer",
              }}
            >
              APAGAR
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-x-5 gap-y-2 text-sm mb-4" style={{ color: "#3C3A34" }}>
          <div style={{ lineHeight: 1.6 }}><span style={{ color: "#8A8272" }}>Supervisor:</span> {item.supervisor}</div>
          <div style={{ lineHeight: 1.6 }}><span style={{ color: "#8A8272" }}>RCA:</span> {item.rca}</div>
          <div style={{ lineHeight: 1.6 }}><span style={{ color: "#8A8272" }}>Pedido/Nota:</span> {item.pedido || "—"}</div>
          <div style={{ lineHeight: 1.6 }}><span style={{ color: "#8A8272" }}>Valor:</span> R$ {Number(item.valor || 0).toFixed(2)}</div>
        </div>

        <div className="text-sm mb-2">
          <span style={{ color: "#8A8272" }}>Motivo original do desconto: </span>
          <span style={{ fontWeight: 600 }}>{item.motivoOriginal}</span>
        </div>

        <div
          style={{
            background: "#F1ECE0",
            border: "1px dashed #C9BFA6",
            borderRadius: "6px",
            padding: "12px 14px",
            marginBottom: "10px",
          }}
        >
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#8A5A12", letterSpacing: "0.05em", marginBottom: "3px" }}>
            CONTESTAÇÃO DO SUPERVISOR
          </div>
          <div style={{ fontSize: "14px", color: "#3C3A34", lineHeight: 1.7 }}>{item.motivoContestacao}</div>
          {item.evidencia && (
            <div style={{ fontSize: "13px", color: "#6B6455", marginTop: "8px" }}>
              <span style={{ fontWeight: 600 }}>Evidência: </span>{item.evidencia}
            </div>
          )}
        </div>

        {item.retorno && (
          <div
            style={{
              background: STATUS_COLORS[item.status].bg,
              borderRadius: "6px",
              padding: "12px 14px",
              marginTop: "10px",
            }}
          >
            <div style={{ fontSize: "12px", fontWeight: 700, color: STATUS_COLORS[item.status].text, letterSpacing: "0.05em", marginBottom: "5px" }}>
              RETORNO DA COORDENAÇÃO
            </div>
            <div style={{ fontSize: "14px", color: "#3C3A34", lineHeight: 1.7 }}>{item.retorno}</div>
          </div>
        )}

        {isCoordenadora && item.status === "Pendente" && (
          <div className="mt-3">
            {!showReview ? (
              <button
                onClick={() => setShowReview(true)}
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#20303D",
                  background: "#EFEAE0",
                  border: "1px solid #C9BFA6",
                  borderRadius: "4px",
                  padding: "6px 12px",
                  cursor: "pointer",
                }}
              >
                ANALISAR →
              </button>
            ) : (
              <div className="space-y-2">
                <textarea
                  value={retorno}
                  onChange={(e) => setRetorno(e.target.value)}
                  placeholder="Justificativa do seu retorno..."
                  rows={2}
                  style={{
                    width: "100%",
                    fontSize: "13px",
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #C9BFA6",
                    background: "#fff",
                    resize: "vertical",
                  }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => decide(STATUS.APROVADO)}
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#fff",
                      background: "#3F6B4F",
                      border: "none",
                      borderRadius: "4px",
                      padding: "7px 14px",
                      cursor: "pointer",
                    }}
                  >
                    APROVAR
                  </button>
                  <button
                    onClick={() => decide(STATUS.NEGADO)}
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#fff",
                      background: "#B0362C",
                      border: "none",
                      borderRadius: "4px",
                      padding: "7px 14px",
                      cursor: "pointer",
                    }}
                  >
                    NEGAR
                  </button>
                  <button
                    onClick={() => setShowReview(false)}
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "12px",
                      color: "#6B6455",
                      background: "transparent",
                      border: "none",
                      padding: "7px 10px",
                      cursor: "pointer",
                    }}
                  >
                    cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function NovaContestacaoForm({ onSubmit }) {
  const [form, setForm] = useState({
    supervisor: "",
    rca: "",
    cliente: "",
    pedido: "",
    motivoOriginal: MOTIVOS_ORIGINAIS[0],
    motivoContestacao: "",
    evidencia: "",
    valor: "",
  });
  const [enviado, setEnviado] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.supervisor || !form.cliente || !form.motivoContestacao) return;
    onSubmit(form);
    setForm({
      supervisor: form.supervisor,
      rca: "",
      cliente: "",
      pedido: "",
      motivoOriginal: MOTIVOS_ORIGINAIS[0],
      motivoContestacao: "",
      evidencia: "",
      valor: "",
    });
    setEnviado(true);
    setTimeout(() => setEnviado(false), 2500);
  };

  const inputStyle = {
    width: "100%",
    fontSize: "14px",
    padding: "9px 10px",
    borderRadius: "4px",
    border: "1px solid #C9BFA6",
    background: "#fff",
    color: "#20303D",
  };
  const labelStyle = { fontSize: "12px", fontWeight: 700, color: "#6B6455", letterSpacing: "0.03em", marginBottom: "4px", display: "block" };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label style={labelStyle}>SUPERVISOR</label>
          <input style={inputStyle} value={form.supervisor} onChange={set("supervisor")} required />
        </div>
        <div>
          <label style={labelStyle}>RCA</label>
          <input style={inputStyle} value={form.rca} onChange={set("rca")} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label style={labelStyle}>CLIENTE</label>
          <input style={inputStyle} value={form.cliente} onChange={set("cliente")} required />
        </div>
        <div>
          <label style={labelStyle}>PEDIDO / NOTA</label>
          <input style={inputStyle} value={form.pedido} onChange={set("pedido")} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label style={labelStyle}>MOTIVO ORIGINAL DO DESCONTO</label>
          <select style={inputStyle} value={form.motivoOriginal} onChange={set("motivoOriginal")}>
            {MOTIVOS_ORIGINAIS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>VALOR (R$)</label>
          <input style={inputStyle} type="number" step="0.01" value={form.valor} onChange={set("valor")} />
        </div>
      </div>

      <div>
        <label style={labelStyle}>MOTIVO DA CONTESTAÇÃO</label>
        <textarea
          style={{ ...inputStyle, resize: "vertical" }}
          rows={3}
          placeholder="Explique por que essa devolução não deveria ser descontada..."
          value={form.motivoContestacao}
          onChange={set("motivoContestacao")}
          required
        />
      </div>

      <div>
        <label style={labelStyle}>EVIDÊNCIA (opcional)</label>
        <input
          style={inputStyle}
          placeholder="Ex: produto entregue foi ancho, pedido constava contra filé"
          value={form.evidencia}
          onChange={set("evidencia")}
        />
      </div>

      <button
        type="submit"
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "13px",
          fontWeight: 700,
          letterSpacing: "0.04em",
          color: "#fff",
          background: "#20303D",
          border: "none",
          borderRadius: "4px",
          padding: "10px 18px",
          cursor: "pointer",
          width: "100%",
        }}
      >
        REGISTRAR CONTESTAÇÃO
      </button>
      {enviado && (
        <div style={{ fontSize: "13px", color: "#2F5240", fontWeight: 600, textAlign: "center" }}>
          ✓ Contestação registrada. Aguarde o retorno da coordenação.
        </div>
      )}
    </form>
  );
}

export default function App() {
  const [role, setRole] = useState(null);
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("Todos");
  const [supervisorSearch, setSupervisorSearch] = useState("");
  const [showCoordinatorPassword, setShowCoordinatorPassword] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contestacoes')
        .select('*')
        .order('criadoEm', { ascending: false });
      
      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar dados do banco.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCoordinatorSubmit = () => {
    if (passwordInput === "Comercial@2026") {
      setShowCoordinatorPassword(false);
      setRole("coordenadora");
    } else {
      setPasswordError("Senha incorreta. Tente novamente.");
    }
  };

  const addItem = async (form) => {
    const novo = {
      id: uid(),
      ...form,
      status: STATUS.PENDENTE,
      retorno: "",
      criadoEm: new Date().toISOString(),
    };
    
    setItems([novo, ...items]); // Atualização otimista
    
    try {
      const { error } = await supabase.from('contestacoes').insert([novo]);
      if (error) throw error;
    } catch (err) {
      console.error(err);
      setError("Não foi possível salvar a contestação no banco.");
      load(); // Recarrega para reverter
    }
  };

  const updateItem = async (id, patch) => {
    setItems(items.map((it) => (it.id === id ? { ...it, ...patch } : it))); // Atualização otimista
    
    try {
      const { error } = await supabase.from('contestacoes').update(patch).eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error(err);
      setError("Não foi possível atualizar a contestação no banco.");
      load();
    }
  };

  const deleteItem = async (id) => {
    setItems(items.filter((it) => it.id !== id)); // Atualização otimista
    
    try {
      const { error } = await supabase.from('contestacoes').delete().eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error(err);
      setError("Não foi possível deletar a contestação no banco.");
      load();
    }
  };

  const filtered = items.filter((it) => (filter === "Todos" ? true : it.status === filter));
  const supervisorFiltered = supervisorSearch.trim()
    ? items.filter((it) => it.supervisor.toLowerCase().includes(supervisorSearch.trim().toLowerCase()))
    : items;
  const supervisorMatches = supervisorSearch.trim() ? supervisorFiltered : items.slice(0, 10);
  const pendentesCount = items.filter((i) => i.status === "Pendente").length;

  if (!role) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#EFEAE0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Inter, system-ui, sans-serif",
          padding: "24px",
        }}
      >
        <div style={{ maxWidth: "380px", width: "100%", textAlign: "center" }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "#8A8272", letterSpacing: "0.1em", marginBottom: "8px" }}>
            NUTRYMAX · CONTROLE DE DEVOLUÇÕES
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#20303D", marginBottom: "6px" }}>
            Contestação de Devoluções
          </h1>
          <p style={{ fontSize: "14px", color: "#6B6455", marginBottom: "28px" }}>
            Registre e acompanhe contestações de descontos por devolução.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <button
              onClick={() => setRole("supervisor")}
              style={{
                width: "100%",
                background: "#fff",
                border: "1.5px solid #C9BFA6",
                borderRadius: "6px",
                padding: "16px",
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              <div style={{ fontWeight: 700, color: "#20303D", fontSize: "15px" }}>Sou Supervisor</div>
              <div style={{ fontSize: "12.5px", color: "#8A8272" }}>Registrar uma contestação</div>
            </button>
            <button
              onClick={() => {
                setPasswordError("");
                setPasswordInput("");
                setShowCoordinatorPassword(true);
              }}
              style={{
                width: "100%",
                background: "#20303D",
                border: "1.5px solid #20303D",
                borderRadius: "6px",
                padding: "16px",
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              <div style={{ fontWeight: 700, color: "#fff", fontSize: "15px" }}>Sou Coordenadora</div>
              <div style={{ fontSize: "12.5px", color: "#C9BFA6" }}>Analisar e responder contestações</div>
            </button>
          </div>
          {showCoordinatorPassword && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0, 0, 0, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px",
                zIndex: 50,
              }}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: "420px",
                  background: "#fff",
                  borderRadius: "14px",
                  padding: "24px",
                  boxShadow: "0 20px 45px rgba(0,0,0,0.15)",
                }}
              >
                <div style={{ fontSize: "18px", fontWeight: 700, color: "#20303D", marginBottom: "10px" }}>
                  Acesso Coordenadora
                </div>
                <div style={{ fontSize: "14px", color: "#6B6455", marginBottom: "18px" }}>
                  Digite a senha para acessar a área de coordenadora.
                </div>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleCoordinatorSubmit();
                    }
                  }}
                  placeholder="Senha de acesso"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    fontSize: "14px",
                    padding: "12px 14px",
                    borderRadius: "8px",
                    border: "1px solid #C9BFA6",
                    marginBottom: "12px",
                  }}
                />
                {passwordError && (
                  <div style={{ color: "#B0362C", fontSize: "13px", marginBottom: "12px" }}>
                    {passwordError}
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                  <button
                    onClick={() => setShowCoordinatorPassword(false)}
                    style={{
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid #C9BFA6",
                      background: "#fff",
                      color: "#20303D",
                      cursor: "pointer",
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      if (passwordInput === "Comercial@2026") {
                        setShowCoordinatorPassword(false);
                        setRole("coordenadora");
                      } else {
                        setPasswordError("Senha incorreta. Tente novamente.");
                      }
                    }}
                    style={{
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "none",
                      background: "#20303D",
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    Entrar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#EFEAE0", fontFamily: "Inter, system-ui, sans-serif" }}>
      <div style={{ background: "#20303D", padding: "16px 20px" }}>
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "#C9BFA6", letterSpacing: "0.1em" }}>
              NUTRYMAX
            </div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: "16px" }}>
              {role === "supervisor" ? "Nova Contestação" : "Painel de Análise"}
            </div>
          </div>
          <button
            onClick={() => setRole(null)}
            style={{ fontSize: "12px", color: "#C9BFA6", background: "transparent", border: "none", cursor: "pointer" }}
          >
            trocar perfil
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4">
        {error && (
          <div style={{ background: "#F0DAD6", color: "#7E2A20", padding: "8px 12px", borderRadius: "4px", fontSize: "13px", marginBottom: "12px" }}>
            {error}
          </div>
        )}

        {role === "supervisor" && (
          <div style={{ background: "#FBF9F4", border: "1px solid #D8D0BE", borderRadius: "6px", padding: "20px", marginBottom: "20px" }}>
            <NovaContestacaoForm onSubmit={addItem} />
          </div>
        )}

        {role === "coordenadora" && (
          <div className="flex gap-2 mb-4 flex-wrap">
            {["Todos", "Pendente", "Aprovado", "Negado"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "12px",
                  fontWeight: 700,
                  padding: "6px 12px",
                  borderRadius: "4px",
                  border: filter === f ? "1.5px solid #20303D" : "1.5px solid #C9BFA6",
                  background: filter === f ? "#20303D" : "#fff",
                  color: filter === f ? "#fff" : "#6B6455",
                  cursor: "pointer",
                }}
              >
                {f}{f === "Pendente" && pendentesCount > 0 ? ` (${pendentesCount})` : ""}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", color: "#8A8272", padding: "40px 0" }}>Carregando...</div>
        ) : (role === "coordenadora" || true) && filtered.length === 0 ? (
          role === "coordenadora" && (
            <div style={{ textAlign: "center", color: "#8A8272", padding: "40px 0", fontSize: "14px" }}>
              Nenhuma contestação {filter !== "Todos" ? `com status "${filter}"` : "registrada"} ainda.
            </div>
          )
        ) : (
          role === "coordenadora" && (
            <div className="space-y-3">
              {filtered.map((item) => (
                <TicketCard key={item.id} item={item} isCoordenadora={true} onUpdate={updateItem} onDelete={deleteItem} />
              ))}
            </div>
          )
        )}

        {role === "supervisor" && items.length > 0 && (
          <div>
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#8A8272", letterSpacing: "0.05em", marginBottom: "8px" }}>
                SUAS ÚLTIMAS CONTESTAÇÕES
              </div>
              <input
                value={supervisorSearch}
                onChange={(e) => setSupervisorSearch(e.target.value)}
                placeholder="Filtrar por nome do supervisor"
                style={{
                  width: "100%",
                  fontSize: "14px",
                  padding: "10px 12px",
                  borderRadius: "6px",
                  border: "1px solid #C9BFA6",
                  background: "#fff",
                  color: "#20303D",
                }}
              />
            </div>
            <div className="space-y-3">
              {supervisorMatches.map((item) => (
                <TicketCard key={item.id} item={item} isCoordenadora={false} onUpdate={updateItem} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}