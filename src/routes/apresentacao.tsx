import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef } from "react";
import {
  lookupPlate,
  isValidPlate,
  formatPlate,
  type PlateLookupResult,
} from "@/lib/plate-lookup";

export const Route = createFileRoute("/apresentacao")({
  head: () => ({
    meta: [
      { title: "Atomo Car Cockpit — Plataforma para Revendas" },
      {
        name: "description",
        content: "Demonstração comercial da plataforma Atomo Car Cockpit.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ApresentacaoPage,
});

const FUEL_LABEL: Record<string, string> = {
  flex: "Flex",
  gasoline: "Gasolina",
  diesel: "Diesel",
  hybrid: "Híbrido",
  electric: "Elétrico",
};

function ApresentacaoPage() {
  const [plate, setPlate] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [result, setResult] = useState<PlateLookupResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const demoRef = useRef<HTMLElement>(null);

  const plateDisplay = plate.length > 3 ? `${plate.slice(0, 3)}-${plate.slice(3)}` : plate;
  const valid = isValidPlate(plate);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setStatus("loading");
    setResult(null);
    setErrorMsg("");
    try {
      const data = await lookupPlate(plate);
      setResult(data);
      setStatus("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Erro na consulta.");
      setStatus("error");
    }
  };

  const reset = () => {
    setStatus("idle");
    setResult(null);
    setErrorMsg("");
    setPlate("");
  };

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{
        background: "#080C0A",
        color: "#fff",
        fontFamily: "'Sora', 'Inter', sans-serif",
      }}
    >
      {/* ── AMBIENT BACKGROUND ── */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div
          style={{
            position: "absolute",
            top: "-10%",
            right: "-5%",
            width: "900px",
            height: "700px",
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(76,193,79,0.09) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "20%",
            left: "-10%",
            width: "700px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(76,193,79,0.05) 0%, transparent 70%)",
          }}
        />
        {/* Subtle grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      {/* ── NAV ── */}
      <nav
        className="relative z-50 flex items-center justify-between px-6 py-4"
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(8,12,10,0.85)",
          backdropFilter: "blur(20px)",
          position: "sticky",
          top: 0,
        }}
      >
        <div className="flex items-center gap-3">
          <img src="/atomo-car-logo.svg" alt="Atomo Car" className="h-8 w-8" />
          <span className="font-semibold tracking-tight">Atomo Car</span>
          <span
            style={{
              fontSize: "9px",
              letterSpacing: "0.22em",
              padding: "2px 8px",
              borderRadius: "999px",
              border: "1px solid rgba(76,193,79,0.4)",
              color: "#4CC14F",
              fontFamily: "monospace",
              textTransform: "uppercase",
            }}
          >
            DEMO
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="text-sm transition-colors"
            style={{ color: "#8A9290" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#8A9290")}
          >
            Ver site →
          </Link>
          <Link
            to="/admin"
            className="text-sm font-semibold transition-all duration-200"
            style={{
              padding: "7px 18px",
              borderRadius: "999px",
              background: "#4CC14F",
              color: "#0B0E0C",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#3aad3d";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px rgba(76,193,79,0.4)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#4CC14F";
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
            }}
          >
            Acessar painel
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative z-10 flex min-h-[92vh] flex-col justify-center px-6 py-20">
        <div className="mx-auto w-full max-w-6xl">
          {/* Eyebrow */}
          <div className="mb-8 flex items-center gap-3">
            <div style={{ width: "36px", height: "1px", background: "#4CC14F" }} />
            <span
              style={{
                fontFamily: "monospace",
                fontSize: "11px",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#4CC14F",
              }}
            >
              Plataforma Operacional para Revendas
            </span>
          </div>

          {/* Headline */}
          <h1
            style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: "clamp(52px, 9.5vw, 128px)",
              fontWeight: 700,
              lineHeight: 0.9,
              letterSpacing: "-0.04em",
              marginBottom: "28px",
            }}
          >
            <span style={{ display: "block", color: "#fff" }}>Gestão de</span>
            <span
              style={{
                display: "block",
                WebkitTextStroke: "1px rgba(255,255,255,0.13)",
                color: "transparent",
              }}
            >
              estoque
            </span>
            <span
              style={{
                display: "block",
                background: "linear-gradient(135deg, #4CC14F 0%, #2E9F38 60%, #196b1e 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              inteligente.
            </span>
          </h1>

          <p
            style={{
              fontSize: "18px",
              color: "#8A9290",
              maxWidth: "440px",
              lineHeight: 1.7,
              marginBottom: "40px",
            }}
          >
            Do cadastro do veículo à publicação no site — tudo em um único
            painel. Menos operação manual, mais vendas.
          </p>

          {/* CTAs */}
          <div className="mb-16 flex flex-wrap gap-4">
            <button
              onClick={() =>
                demoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
              className="flex items-center gap-2.5 transition-all duration-200"
              style={{
                padding: "14px 28px",
                borderRadius: "999px",
                background: "#4CC14F",
                color: "#0B0E0C",
                fontWeight: 700,
                fontSize: "14px",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#3aad3d";
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 0 30px rgba(76,193,79,0.45)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#4CC14F";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#0B0E0C",
                  animation: "pulse 2s infinite",
                }}
              />
              Ver demo ao vivo
            </button>
            <Link
              to="/"
              className="flex items-center gap-2 transition-all duration-200"
              style={{
                padding: "14px 28px",
                borderRadius: "999px",
                border: "1px solid rgba(255,255,255,0.14)",
                color: "#fff",
                fontSize: "14px",
                fontWeight: 500,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "rgba(255,255,255,0.3)";
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(255,255,255,0.05)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "rgba(255,255,255,0.14)";
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              Visitar o site protótipo
              <span style={{ color: "#4CC14F" }}>→</span>
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-8">
            {[
              { value: "< 2 min", label: "para cadastrar um veículo" },
              { value: "100%", label: "na nuvem, sem instalação" },
              { value: "Realtime", label: "estoque atualizado ao vivo" },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  borderLeft: "2px solid rgba(76,193,79,0.35)",
                  paddingLeft: "16px",
                }}
              >
                <div
                  style={{
                    fontSize: "22px",
                    fontWeight: 700,
                    color: "#4CC14F",
                    fontFamily: "'Sora', sans-serif",
                  }}
                >
                  {s.value}
                </div>
                <div style={{ fontSize: "11px", color: "#8A9290", marginTop: "2px" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{ opacity: 0.35 }}
        >
          <span style={{ fontSize: "9px", fontFamily: "monospace", letterSpacing: "0.25em", color: "#8A9290", textTransform: "uppercase" }}>
            scroll
          </span>
          <div
            style={{
              width: "1px",
              height: "32px",
              background: "linear-gradient(to bottom, #4CC14F, transparent)",
            }}
          />
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section
        className="relative z-10 py-24 px-6"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-14">
            <span
              style={{
                fontFamily: "monospace",
                fontSize: "11px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#4CC14F",
                display: "block",
                marginBottom: "12px",
              }}
            >
              Módulos da plataforma
            </span>
            <h2
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: "clamp(32px, 5vw, 52px)",
                fontWeight: 700,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
              }}
            >
              Uma plataforma,
              <br />
              toda a operação.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[
              {
                icon: "⚡",
                title: "Cadastro Rápido",
                desc: "Cadastre um veículo completo — fotos e opcionais incluídos — em menos de 2 minutos. Publicação automática no site.",
                tag: "MVP",
                highlight: false,
              },
              {
                icon: "🔍",
                title: "Leitura de Placa",
                desc: "Digite a placa e o sistema importa marca, modelo, versão, ano, cor e combustível via API. Zero digitação manual.",
                tag: "AO VIVO",
                highlight: true,
              },
              {
                icon: "📊",
                title: "Painel Operacional",
                desc: "Dashboard com visão completa: estoque, leads pendentes, veículos críticos e ações rápidas em um único lugar.",
                tag: "MVP",
                highlight: false,
              },
              {
                icon: "🤖",
                title: "IA + Marketing",
                desc: "Geração de conteúdo com inteligência artificial, publicação automática e anúncios para portais de venda.",
                tag: "EM BREVE",
                highlight: false,
                dim: true,
              },
            ].map((f) => (
              <div
                key={f.title}
                style={{
                  borderRadius: "20px",
                  padding: "28px",
                  border: f.highlight
                    ? "1px solid rgba(76,193,79,0.35)"
                    : "1px solid rgba(255,255,255,0.07)",
                  background: f.highlight
                    ? "rgba(76,193,79,0.06)"
                    : f.dim
                    ? "rgba(23,27,24,0.3)"
                    : "#171B18",
                  opacity: f.dim ? 0.55 : 1,
                  position: "relative",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!f.dim) {
                    (e.currentTarget as HTMLElement).style.borderColor = f.highlight
                      ? "rgba(76,193,79,0.55)"
                      : "rgba(255,255,255,0.14)";
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = f.highlight
                    ? "rgba(76,193,79,0.35)"
                    : "rgba(255,255,255,0.07)";
                }}
              >
                {f.highlight && (
                  <span
                    style={{
                      position: "absolute",
                      top: "14px",
                      right: "14px",
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#4CC14F",
                      animation: "pulse 2s infinite",
                    }}
                  />
                )}
                <div style={{ fontSize: "28px", marginBottom: "14px" }}>{f.icon}</div>
                <div
                  className="mb-2 flex items-center gap-2.5"
                >
                  <h3
                    style={{
                      fontSize: "17px",
                      fontWeight: 700,
                      color: "#fff",
                    }}
                  >
                    {f.title}
                  </h3>
                  <span
                    style={{
                      fontSize: "9px",
                      fontFamily: "monospace",
                      letterSpacing: "0.15em",
                      padding: "2px 8px",
                      borderRadius: "999px",
                      border: `1px solid ${f.highlight ? "rgba(76,193,79,0.45)" : "rgba(255,255,255,0.12)"}`,
                      color: f.highlight ? "#4CC14F" : "#8A9290",
                    }}
                  >
                    {f.tag}
                  </span>
                </div>
                <p style={{ fontSize: "13px", color: "#8A9290", lineHeight: 1.7 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FLOW DIAGRAM ── */}
      <section
        className="relative z-10 py-20 px-6"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="mx-auto max-w-4xl text-center">
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "11px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#4CC14F",
              display: "block",
              marginBottom: "12px",
            }}
          >
            Fluxo completo
          </span>
          <h2
            style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: "clamp(26px, 4vw, 40px)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              marginBottom: "48px",
            }}
          >
            Do cadastro ao cliente em minutos.
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-0">
            {[
              { step: "01", label: "Login no painel", icon: "🔐" },
              { step: "02", label: "Cadastrar veículo", icon: "📋" },
              { step: "03", label: "Upload de fotos", icon: "📸" },
              { step: "04", label: "Publicar", icon: "🚀" },
              { step: "05", label: "Site atualiza", icon: "✅" },
            ].map((s, i) => (
              <div key={s.step} className="flex items-center">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "16px",
                      border: "1px solid rgba(76,193,79,0.3)",
                      background: "rgba(76,193,79,0.07)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "22px",
                    }}
                  >
                    {s.icon}
                  </div>
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: "9px",
                      color: "#4CC14F",
                      letterSpacing: "0.1em",
                    }}
                  >
                    {s.step}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#8A9290",
                      whiteSpace: "nowrap",
                      maxWidth: "80px",
                      textAlign: "center",
                      lineHeight: 1.3,
                    }}
                  >
                    {s.label}
                  </span>
                </div>
                {i < 4 && (
                  <div
                    style={{
                      width: "32px",
                      height: "1px",
                      background:
                        "linear-gradient(90deg, rgba(76,193,79,0.4), rgba(76,193,79,0.15))",
                      margin: "0 4px",
                      marginBottom: "28px",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLATE DEMO ── */}
      <section
        ref={demoRef}
        className="relative z-10 py-24 px-6"
        style={{
          borderTop: "1px solid rgba(255,255,255,0.05)",
          background:
            "radial-gradient(ellipse 100% 80% at 50% 50%, rgba(76,193,79,0.04) 0%, transparent 70%)",
        }}
      >
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-12 text-center">
            <div
              className="mb-5 inline-flex items-center gap-2"
              style={{
                padding: "8px 18px",
                borderRadius: "999px",
                border: "1px solid rgba(76,193,79,0.38)",
                background: "rgba(76,193,79,0.07)",
              }}
            >
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "#4CC14F",
                  animation: "pulse 2s infinite",
                }}
              />
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: "10px",
                  letterSpacing: "0.22em",
                  color: "#4CC14F",
                  textTransform: "uppercase",
                }}
              >
                Demonstração ao vivo
              </span>
            </div>

            <h2
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: "clamp(30px, 5vw, 52px)",
                fontWeight: 700,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                marginBottom: "16px",
              }}
            >
              Consulta de placa
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #4CC14F 0%, #2E9F38 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                em tempo real.
              </span>
            </h2>
            <p style={{ color: "#8A9290", maxWidth: "380px", margin: "0 auto", lineHeight: 1.65 }}>
              Digite qualquer placa brasileira. O sistema identifica o veículo instantaneamente — sem digitação manual.
            </p>
          </div>

          {/* Plate form */}
          <form onSubmit={handleLookup}>
            <div className="flex flex-col items-center gap-5">
              {/* Styled plate */}
              <div
                style={{
                  border: "3px solid #1a1a1a",
                  borderRadius: "12px",
                  overflow: "hidden",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)",
                }}
              >
                {/* Top blue bar */}
                <div
                  style={{
                    background: "linear-gradient(135deg, #003087 0%, #001a6e 100%)",
                    padding: "5px 24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "9px",
                      fontWeight: 700,
                      color: "#fff",
                      letterSpacing: "0.35em",
                      textTransform: "uppercase",
                    }}
                  >
                    BRASIL
                  </span>
                  <span style={{ color: "#FFD700", fontSize: "8px" }}>✦ ✦ ✦</span>
                </div>
                {/* Plate input */}
                <input
                  type="text"
                  value={plateDisplay}
                  onChange={(e) => {
                    const raw = e.target.value
                      .replace(/[^A-Za-z0-9]/g, "")
                      .toUpperCase()
                      .slice(0, 7);
                    setPlate(raw);
                    if (status !== "idle") {
                      setStatus("idle");
                      setResult(null);
                      setErrorMsg("");
                    }
                  }}
                  placeholder="ABC-1234"
                  maxLength={8}
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  style={{
                    width: "220px",
                    textAlign: "center",
                    fontSize: "42px",
                    fontFamily: "monospace",
                    fontWeight: 700,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    background: "#F5F0DC",
                    color: "#111",
                    border: "none",
                    outline: "none",
                    padding: "14px 20px",
                    display: "block",
                  }}
                />
              </div>

              {/* Validation hint */}
              {plate.length > 0 && !valid && (
                <p
                  style={{
                    fontFamily: "monospace",
                    fontSize: "11px",
                    color: "rgba(229,72,77,0.85)",
                  }}
                >
                  Formato inválido · use ABC-1234 ou ABC1D23
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={!valid || status === "loading"}
                className="flex items-center gap-2.5 transition-all duration-200"
                style={{
                  padding: "13px 32px",
                  borderRadius: "999px",
                  background: valid && status !== "loading" ? "#4CC14F" : "rgba(76,193,79,0.25)",
                  color: valid && status !== "loading" ? "#0B0E0C" : "rgba(255,255,255,0.35)",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: valid && status !== "loading" ? "pointer" : "not-allowed",
                  border: "none",
                }}
                onMouseEnter={(e) => {
                  if (valid && status !== "loading") {
                    (e.currentTarget as HTMLElement).style.background = "#3aad3d";
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "0 0 28px rgba(76,193,79,0.45)";
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    valid && status !== "loading" ? "#4CC14F" : "rgba(76,193,79,0.25)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
              >
                {status === "loading" ? (
                  <>
                    <svg
                      style={{ width: "16px", height: "16px", animation: "spin 1s linear infinite" }}
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeDasharray="40"
                        strokeDashoffset="10"
                      />
                    </svg>
                    Consultando API...
                  </>
                ) : (
                  <>
                    <svg
                      style={{ width: "16px", height: "16px" }}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                    Consultar placa
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Error */}
          {status === "error" && (
            <div
              className="mt-6"
              style={{
                borderRadius: "16px",
                border: "1px solid rgba(229,72,77,0.3)",
                background: "rgba(229,72,77,0.06)",
                padding: "20px 24px",
                textAlign: "center",
                animation: "fade-up 0.4s cubic-bezier(0.22, 1, 0.36, 1) both",
              }}
            >
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>⚠️</div>
              <p style={{ fontSize: "13px", color: "#E5484D" }}>{errorMsg}</p>
              {(errorMsg.includes("Token") || errorMsg.includes("configurado")) && (
                <p style={{ fontSize: "11px", color: "#8A9290", marginTop: "6px", fontFamily: "monospace" }}>
                  Configure PLATE_API_TOKEN no ambiente para ativar
                </p>
              )}
            </div>
          )}

          {/* Success result */}
          {status === "success" && result && (
            <div
              className="mt-6"
              style={{
                borderRadius: "20px",
                border: "1px solid rgba(76,193,79,0.3)",
                background: "#171B18",
                padding: "24px",
                boxShadow: "0 0 60px rgba(76,193,79,0.09)",
                animation: "fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
              }}
            >
              {/* Result header */}
              <div
                className="mb-5 flex items-center gap-3"
                style={{ paddingBottom: "18px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "12px",
                    background: "rgba(76,193,79,0.13)",
                    border: "1px solid rgba(76,193,79,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg
                    style={{ width: "20px", height: "20px", color: "#4CC14F" }}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "monospace",
                      fontSize: "10px",
                      letterSpacing: "0.18em",
                      color: "#4CC14F",
                      textTransform: "uppercase",
                    }}
                  >
                    Veículo identificado
                  </div>
                  <div
                    style={{ fontSize: "12px", fontFamily: "monospace", color: "#8A9290" }}
                  >
                    Placa {formatPlate(result.plate)}
                  </div>
                </div>
                <div style={{ marginLeft: "auto" }}>
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: "10px",
                      padding: "4px 10px",
                      borderRadius: "999px",
                      background: "rgba(76,193,79,0.12)",
                      border: "1px solid rgba(76,193,79,0.25)",
                      color: "#4CC14F",
                    }}
                  >
                    ✓ ATIVO
                  </span>
                </div>
              </div>

              {/* Data grid */}
              <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                  { label: "Marca", value: result.brand },
                  { label: "Modelo", value: result.model },
                  { label: "Versão", value: result.version || "—" },
                  {
                    label: "Ano Fab./Mod.",
                    value: `${result.yearManufacture}/${result.yearModel}`,
                  },
                  { label: "Cor", value: result.color },
                  { label: "Combustível", value: FUEL_LABEL[result.fuel] ?? result.fuel },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    style={{
                      background: "#0F1411",
                      borderRadius: "12px",
                      padding: "14px 16px",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "monospace",
                        fontSize: "9px",
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        color: "#8A9290",
                        marginBottom: "4px",
                      }}
                    >
                      {label}
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#fff",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Link
                  to="/admin"
                  className="flex-1 py-2.5 text-center font-bold transition-colors duration-200"
                  style={{
                    borderRadius: "12px",
                    background: "#4CC14F",
                    color: "#0B0E0C",
                    fontSize: "13px",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.background = "#3aad3d")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.background = "#4CC14F")
                  }
                >
                  Usar no cadastro
                </Link>
                <button
                  onClick={reset}
                  className="transition-colors duration-200"
                  style={{
                    padding: "10px 16px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#8A9290",
                    fontSize: "13px",
                    background: "transparent",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "rgba(255,255,255,0.2)";
                    (e.currentTarget as HTMLElement).style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "rgba(255,255,255,0.1)";
                    (e.currentTarget as HTMLElement).style.color = "#8A9290";
                  }}
                >
                  Nova consulta
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── NAVIGATION CARDS ── */}
      <section
        className="relative z-10 py-24 px-6"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: "clamp(26px, 4vw, 40px)",
                fontWeight: 700,
                letterSpacing: "-0.03em",
              }}
            >
              Explore a plataforma
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Site público */}
            <Link
              to="/"
              style={{
                display: "block",
                borderRadius: "24px",
                padding: "32px",
                border: "1px solid rgba(255,255,255,0.07)",
                background: "#171B18",
                textDecoration: "none",
                position: "relative",
                overflow: "hidden",
                transition: "border-color 0.25s, box-shadow 0.25s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "rgba(76,193,79,0.3)";
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 0 40px rgba(76,193,79,0.07)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "rgba(255,255,255,0.07)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              {/* Glow */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: "200px",
                  height: "200px",
                  borderRadius: "50%",
                  background: "rgba(76,193,79,0.04)",
                  filter: "blur(40px)",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "16px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.04)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px",
                  marginBottom: "20px",
                }}
              >
                🌐
              </div>
              <h3
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#fff",
                  marginBottom: "8px",
                }}
              >
                Site Protótipo
              </h3>
              <p
                style={{
                  fontSize: "13px",
                  color: "#8A9290",
                  lineHeight: 1.7,
                  marginBottom: "24px",
                }}
              >
                Site público completo com estoque de veículos, páginas individuais, sobre, contato e captação de leads via WhatsApp.
              </p>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#4CC14F",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                Abrir o site
                <svg
                  style={{ width: "14px", height: "14px" }}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </Link>

            {/* Painel admin */}
            <Link
              to="/admin"
              style={{
                display: "block",
                borderRadius: "24px",
                padding: "32px",
                border: "1px solid rgba(255,255,255,0.07)",
                background: "#171B18",
                textDecoration: "none",
                position: "relative",
                overflow: "hidden",
                transition: "border-color 0.25s, box-shadow 0.25s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "rgba(76,193,79,0.3)";
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 0 40px rgba(76,193,79,0.07)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "rgba(255,255,255,0.07)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: "200px",
                  height: "200px",
                  borderRadius: "50%",
                  background: "rgba(76,193,79,0.04)",
                  filter: "blur(40px)",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "16px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.04)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px",
                  marginBottom: "20px",
                }}
              >
                ⚙️
              </div>
              <h3
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#fff",
                  marginBottom: "8px",
                }}
              >
                Atomo Car Cockpit
              </h3>
              <p
                style={{
                  fontSize: "13px",
                  color: "#8A9290",
                  lineHeight: 1.7,
                  marginBottom: "24px",
                }}
              >
                Painel administrativo completo: dashboard operacional, cadastro de veículos, gestão de leads, relatórios e configurações.
              </p>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#4CC14F",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                Acessar o painel
                <svg
                  style={{ width: "14px", height: "14px" }}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        className="relative z-10 px-6 py-8"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <img src="/atomo-car-logo.svg" alt="Atomo Car" className="h-6 w-6" />
            <span style={{ fontSize: "13px", fontWeight: 600 }}>Atomo Car</span>
            <span style={{ color: "#8A9290", fontSize: "13px" }}>
              — Tecnologia para revendas
            </span>
          </div>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: "11px",
              color: "#8A9290",
            }}
          >
            © 2026 · Página de demonstração · Uso interno
          </div>
        </div>
      </footer>

      {/* Inline keyframe for spin */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
