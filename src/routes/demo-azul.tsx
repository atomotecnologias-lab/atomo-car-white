/**
 * Demo alternativo — paleta Azul Premium.
 * Simula um site de revenda independente para apresentação a clientes.
 * Rota standalone sem header/footer compartilhado.
 */
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { mockVehicles } from "@/data/mockVehicles";

export const Route = createFileRoute("/demo-azul")({
  head: () => ({
    meta: [
      { title: "AutoNova — Seminovos Selecionados" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DemoAzulPage,
});

/* ─── helpers ─── */
function fmtPrice(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}
function fmtKm(n: number) {
  return n.toLocaleString("pt-BR") + " km";
}
const TRANS: Record<string, string> = {
  automatic: "Automático", manual: "Manual", cvt: "CVT",
};
const FUEL: Record<string, string> = {
  flex: "Flex", gasoline: "Gasolina", diesel: "Diesel", hybrid: "Híbrido", electric: "Elétrico",
};

/* ─── design tokens ─── */
const T = {
  bg:       "#04101F",
  surface:  "#081628",
  card:     "#0C1E38",
  cardHov:  "#0F2445",
  border:   "rgba(255,255,255,0.08)",
  borderHov:"rgba(59,130,246,0.45)",
  blue:     "#2563EB",
  blueLt:   "#3B82F6",
  blueGlow: "rgba(37,99,235,0.35)",
  txt:      "#FFFFFF",
  muted:    "#7B9EB8",
  dim:      "#4A6A85",
  badge:    "rgba(37,99,235,0.15)",
};

const published = mockVehicles.filter((v) => v.isPublished);
const featured  = published.filter((v) => v.isFeatured).slice(0, 3);
const grid      = published.slice(0, 6);

/* ═══════════════════════════════════════════════════════ */
function DemoAzulPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("Todos");

  const filters = ["Todos", "SUV", "Sedan", "Hatch"];
  const filtered = activeFilter === "Todos" ? grid : grid.slice(0, 4);

  return (
    <div style={{ background: T.bg, color: T.txt, fontFamily: "'Sora','Inter',sans-serif", minHeight: "100vh", overflowX: "hidden" }}>

      {/* ── TOP BAR ── */}
      <div style={{ background: T.blue, padding: "8px 0", textAlign: "center" }}>
        <p style={{ fontSize: "12px", letterSpacing: "0.05em", color: "#fff", margin: 0 }}>
          🚗 &nbsp;Financiamento em até 60x — consulte nossas condições &nbsp;|&nbsp; (11) 99999-9999
        </p>
      </div>

      {/* ── NAV ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(4,16,31,0.95)", backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${T.border}`,
        padding: "0 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: "64px",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "10px",
            background: `linear-gradient(135deg, ${T.blue}, #1d4ed8)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "18px", fontWeight: 800, color: "#fff",
            boxShadow: `0 4px 14px ${T.blueGlow}`,
          }}>A</div>
          <div>
            <span style={{ fontWeight: 700, fontSize: "17px", letterSpacing: "-0.02em" }}>AutoNova</span>
            <span style={{ fontSize: "10px", color: T.muted, display: "block", lineHeight: 1, letterSpacing: "0.08em" }}>SEMINOVOS</span>
          </div>
        </div>

        {/* Links desktop */}
        <div className="hidden md:flex" style={{ gap: "32px", alignItems: "center" }}>
          {["Estoque", "Financiamento", "Avalie seu Carro", "Sobre", "Contato"].map((l) => (
            <a
              key={l}
              href="#"
              style={{ fontSize: "13px", color: T.muted, textDecoration: "none", transition: "color .15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = T.muted)}
            >
              {l}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex" style={{ gap: "10px", alignItems: "center" }}>
          <a
            href="#"
            style={{
              fontSize: "13px", fontWeight: 600, padding: "8px 20px",
              borderRadius: "999px", background: T.blue, color: "#fff",
              textDecoration: "none", transition: "background .15s, box-shadow .15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = T.blueLt;
              (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${T.blueGlow}`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = T.blue;
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
            }}
          >
            Ver Estoque
          </a>
        </div>

        {/* Hamburger */}
        <button
          className="flex md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: "8px", fontSize: "22px" }}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          position: "fixed", top: "107px", left: 0, right: 0, zIndex: 99,
          background: T.surface, borderBottom: `1px solid ${T.border}`,
          padding: "16px 24px", display: "flex", flexDirection: "column", gap: "16px",
        }}>
          {["Estoque", "Financiamento", "Avalie seu Carro", "Sobre", "Contato"].map((l) => (
            <a key={l} href="#" style={{ color: T.muted, textDecoration: "none", fontSize: "15px" }}>
              {l}
            </a>
          ))}
        </div>
      )}

      {/* ── HERO ── */}
      <section style={{
        minHeight: "88vh", display: "flex", alignItems: "center",
        position: "relative", overflow: "hidden",
        padding: "80px 24px",
      }}>
        {/* Background */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <div style={{
            position: "absolute", right: "-5%", top: "50%", transform: "translateY(-50%)",
            width: "55%", height: "100%",
            background: `radial-gradient(ellipse 70% 90% at 60% 50%, rgba(37,99,235,0.14) 0%, transparent 70%)`,
          }} />
          {/* Diagonal stripe */}
          <div style={{
            position: "absolute", right: 0, top: 0, bottom: 0, width: "45%",
            background: `linear-gradient(135deg, transparent 0%, rgba(8,22,40,0.9) 100%)`,
            clipPath: "polygon(15% 0, 100% 0, 100% 100%, 0% 100%)",
          }} />
          {/* Grid dots */}
          <div style={{
            position: "absolute", inset: 0, opacity: 0.04,
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }} />
        </div>

        <div style={{ position: "relative", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", alignItems: "center" }}>
            {/* Left */}
            <div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                background: T.badge, border: `1px solid rgba(37,99,235,0.3)`,
                borderRadius: "999px", padding: "5px 14px", marginBottom: "24px",
              }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: T.blue }} />
                <span style={{ fontSize: "11px", letterSpacing: "0.15em", color: T.blueLt, fontFamily: "monospace", textTransform: "uppercase" }}>
                  Seminovos Certificados
                </span>
              </div>

              <h1 style={{
                fontSize: "clamp(38px, 5.5vw, 68px)", fontWeight: 800,
                letterSpacing: "-0.035em", lineHeight: 1.0, marginBottom: "20px",
              }}>
                <span style={{ display: "block", color: "#fff" }}>O carro certo,</span>
                <span style={{ display: "block", color: "#fff" }}>pelo preço</span>
                <span style={{
                  display: "block",
                  background: `linear-gradient(90deg, ${T.blue} 0%, ${T.blueLt} 100%)`,
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>
                  que você merece.
                </span>
              </h1>

              <p style={{ fontSize: "16px", color: T.muted, lineHeight: 1.7, maxWidth: "420px", marginBottom: "36px" }}>
                Mais de {published.length} veículos seminovos selecionados, com procedência garantida,
                laudo cautelar e as melhores condições de financiamento da região.
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                <a
                  href="#estoque"
                  style={{
                    padding: "14px 28px", borderRadius: "999px",
                    background: T.blue, color: "#fff", fontWeight: 700, fontSize: "14px",
                    textDecoration: "none", transition: "all .2s",
                    boxShadow: `0 4px 20px ${T.blueGlow}`,
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = T.blueLt)}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = T.blue)}
                >
                  Ver todo o estoque
                </a>
                <a
                  href="#"
                  style={{
                    padding: "14px 28px", borderRadius: "999px",
                    border: `1px solid ${T.border}`, color: "#fff",
                    fontSize: "14px", textDecoration: "none", transition: "all .2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = T.blueLt;
                    (e.currentTarget as HTMLElement).style.background = "rgba(59,130,246,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = T.border;
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  Financiar meu carro
                </a>
              </div>

              {/* Trust badges */}
              <div style={{ display: "flex", gap: "24px", marginTop: "40px", flexWrap: "wrap" }}>
                {[
                  { icon: "✓", text: "Laudo cautelar incluso" },
                  { icon: "✓", text: "Revisão em dia" },
                  { icon: "✓", text: "Aceita troca" },
                ].map((b) => (
                  <div key={b.text} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{
                      width: "18px", height: "18px", borderRadius: "50%",
                      background: "rgba(37,99,235,0.2)", border: `1px solid rgba(37,99,235,0.4)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "9px", color: T.blueLt, flexShrink: 0,
                    }}>{b.icon}</span>
                    <span style={{ fontSize: "12px", color: T.muted }}>{b.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — featured car card */}
            {featured[0] && (
              <div style={{
                borderRadius: "20px", overflow: "hidden",
                border: `1px solid ${T.border}`,
                boxShadow: `0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px ${T.border}`,
                background: T.card,
                position: "relative",
              }}>
                <div style={{ position: "relative" }}>
                  <img
                    src={featured[0].mainImage}
                    alt={`${featured[0].brand} ${featured[0].model}`}
                    style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block" }}
                  />
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(to top, rgba(8,22,40,0.9) 0%, transparent 50%)",
                  }} />
                  <div style={{
                    position: "absolute", top: "14px", left: "14px",
                    background: T.blue, color: "#fff",
                    fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em",
                    padding: "4px 10px", borderRadius: "999px",
                  }}>
                    DESTAQUE
                  </div>
                </div>
                <div style={{ padding: "20px 22px" }}>
                  <div style={{ fontSize: "11px", color: T.muted, marginBottom: "4px", letterSpacing: "0.05em" }}>
                    {featured[0].brand} · {featured[0].yearModel}
                  </div>
                  <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "6px", letterSpacing: "-0.02em" }}>
                    {featured[0].model} {featured[0].version}
                  </h3>
                  <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: T.dim, marginBottom: "16px" }}>
                    <span>{fmtKm(featured[0].mileage)}</span>
                    <span>·</span>
                    <span>{TRANS[featured[0].transmission] ?? featured[0].transmission}</span>
                    <span>·</span>
                    <span>{featured[0].color}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: "10px", color: T.dim }}>A partir de</div>
                      <div style={{ fontSize: "26px", fontWeight: 800, color: T.blue, letterSpacing: "-0.03em" }}>
                        {fmtPrice(featured[0].price)}
                      </div>
                    </div>
                    <a
                      href="#"
                      style={{
                        padding: "10px 20px", borderRadius: "10px",
                        background: T.blue, color: "#fff", fontSize: "13px", fontWeight: 600,
                        textDecoration: "none", transition: "background .15s",
                      }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = T.blueLt)}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = T.blue)}
                    >
                      Ver detalhes →
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div style={{
        background: T.surface, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`,
        padding: "28px 24px",
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "48px" }}>
          {[
            { value: `${published.length}+`, label: "Veículos em estoque" },
            { value: "100%", label: "com laudo cautelar" },
            { value: "60x", label: "parcelas sem entrada" },
            { value: "15 anos", label: "no mercado" },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "28px", fontWeight: 800, color: T.blue, letterSpacing: "-0.03em" }}>{s.value}</div>
              <div style={{ fontSize: "12px", color: T.muted, marginTop: "2px" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── ESTOQUE ── */}
      <section id="estoque" style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "36px", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <p style={{ fontSize: "11px", fontFamily: "monospace", letterSpacing: "0.18em", color: T.blue, textTransform: "uppercase", marginBottom: "6px" }}>
                Estoque disponível
              </p>
              <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                Encontre o veículo ideal
              </h2>
            </div>
            <a
              href="#"
              style={{
                fontSize: "13px", color: T.blueLt, textDecoration: "none",
                border: `1px solid rgba(59,130,246,0.3)`, borderRadius: "999px",
                padding: "8px 18px", transition: "all .15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(59,130,246,0.08)";
                (e.currentTarget as HTMLElement).style.borderColor = T.blueLt;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(59,130,246,0.3)";
              }}
            >
              Ver todos os veículos →
            </a>
          </div>

          {/* Filter pills */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "28px", flexWrap: "wrap" }}>
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                style={{
                  padding: "7px 18px", borderRadius: "999px", fontSize: "13px",
                  border: `1px solid ${activeFilter === f ? T.blue : T.border}`,
                  background: activeFilter === f ? "rgba(37,99,235,0.15)" : "transparent",
                  color: activeFilter === f ? T.blueLt : T.muted,
                  cursor: "pointer", transition: "all .15s",
                }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Vehicle grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
            {filtered.map((v) => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
        </div>
      </section>

      {/* ── DIFERENCIAIS ── */}
      <section style={{
        padding: "80px 24px",
        background: T.surface,
        borderTop: `1px solid ${T.border}`,
        borderBottom: `1px solid ${T.border}`,
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <p style={{ fontSize: "11px", fontFamily: "monospace", letterSpacing: "0.18em", color: T.blue, textTransform: "uppercase", marginBottom: "8px" }}>
              Por que escolher a AutoNova
            </p>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 800, letterSpacing: "-0.03em" }}>
              Sua próxima compra começa aqui.
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
            {[
              { icon: "🔍", title: "Laudo Cautelar", desc: "Todos os veículos passam por inspeção completa de 150 pontos antes de entrar no estoque." },
              { icon: "💳", title: "Financiamento Fácil", desc: "Trabalhamos com todos os bancos para encontrar a melhor taxa para você, com aprovação rápida." },
              { icon: "🔄", title: "Aceita Troca", desc: "Avaliamos seu veículo e descontamos no valor da compra. Processo rápido e transparente." },
              { icon: "📋", title: "Documentação inclusa", desc: "Transferência e todos os documentos cuidados por nós. Você só precisa assinar e pegar o carro." },
            ].map((d) => (
              <div
                key={d.title}
                style={{
                  borderRadius: "16px", padding: "28px 24px",
                  border: `1px solid ${T.border}`,
                  background: T.card, transition: "border-color .2s, transform .2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(37,99,235,0.35)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = T.border;
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                }}
              >
                <div style={{
                  width: "48px", height: "48px", borderRadius: "14px",
                  background: T.badge, border: `1px solid rgba(37,99,235,0.2)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "22px", marginBottom: "16px",
                }}>
                  {d.icon}
                </div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>{d.title}</h3>
                <p style={{ fontSize: "13px", color: T.muted, lineHeight: 1.65 }}>{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DESTAQUES ── */}
      <section style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ marginBottom: "36px" }}>
            <p style={{ fontSize: "11px", fontFamily: "monospace", letterSpacing: "0.18em", color: T.blue, textTransform: "uppercase", marginBottom: "6px" }}>
              Seleção especial
            </p>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 800, letterSpacing: "-0.03em" }}>
              Destaques da semana
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
            {featured.map((v) => (
              <FeaturedCard key={v.id} vehicle={v} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FAIXA ── */}
      <section style={{
        padding: "64px 24px",
        background: `linear-gradient(135deg, #081628 0%, #0d1f3c 50%, #081628 100%)`,
        borderTop: `1px solid ${T.border}`,
        borderBottom: `1px solid ${T.border}`,
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: `radial-gradient(ellipse 60% 100% at 50% 0%, rgba(37,99,235,0.12) 0%, transparent 70%)`,
        }} />
        <div style={{ maxWidth: "720px", margin: "0 auto", textAlign: "center", position: "relative" }}>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "14px" }}>
            Encontrou o carro ideal?
          </h2>
          <p style={{ fontSize: "16px", color: T.muted, lineHeight: 1.65, marginBottom: "32px" }}>
            Fale agora com um de nossos consultores. Atendemos presencialmente e pelo WhatsApp.
            Resposta em minutos.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href="https://wa.me/5511999999999"
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "14px 28px", borderRadius: "999px",
                background: "#25D366", color: "#fff", fontWeight: 700, fontSize: "14px",
                textDecoration: "none", transition: "all .2s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#1ebe5d")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#25D366")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.7"/>
              </svg>
              Falar pelo WhatsApp
            </a>
            <a
              href="#"
              style={{
                padding: "14px 28px", borderRadius: "999px",
                border: `1px solid rgba(255,255,255,0.15)`, color: "#fff",
                fontSize: "14px", textDecoration: "none", transition: "all .2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = T.blueLt;
                (e.currentTarget as HTMLElement).style.background = "rgba(59,130,246,0.08)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.15)";
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              Ver todas as formas de contato
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: "48px 24px 32px", borderTop: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "36px", marginBottom: "40px" }}>
            {/* Brand */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                <div style={{
                  width: "34px", height: "34px", borderRadius: "9px",
                  background: `linear-gradient(135deg, ${T.blue}, #1d4ed8)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "16px", fontWeight: 800, color: "#fff",
                }}>A</div>
                <span style={{ fontWeight: 700, fontSize: "16px" }}>AutoNova</span>
              </div>
              <p style={{ fontSize: "12px", color: T.muted, lineHeight: 1.7, maxWidth: "220px" }}>
                Seminovos selecionados com procedência, laudo e as melhores condições de financiamento.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.dim, marginBottom: "14px" }}>
                Navegação
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {["Estoque", "Financiamento", "Avalie seu Carro", "Sobre Nós", "Contato"].map((l) => (
                  <a key={l} href="#" style={{ fontSize: "13px", color: T.muted, textDecoration: "none" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = T.muted)}
                  >{l}</a>
                ))}
              </div>
            </div>

            {/* Contato */}
            <div>
              <h4 style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.dim, marginBottom: "14px" }}>
                Contato
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <p style={{ fontSize: "13px", color: T.muted, margin: 0 }}>📍 Av. das Nações, 1000 — São Paulo</p>
                <p style={{ fontSize: "13px", color: T.muted, margin: 0 }}>📞 (11) 99999-9999</p>
                <p style={{ fontSize: "13px", color: T.muted, margin: 0 }}>✉️ contato@autonova.com.br</p>
              </div>
            </div>

            {/* Horários */}
            <div>
              <h4 style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.dim, marginBottom: "14px" }}>
                Horário
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  { d: "Seg — Sex", h: "08h às 18h" },
                  { d: "Sábados", h: "09h às 13h" },
                  { d: "Domingos", h: "Fechado" },
                ].map((h) => (
                  <div key={h.d} style={{ display: "flex", justifyContent: "space-between", maxWidth: "180px" }}>
                    <span style={{ fontSize: "12px", color: T.dim }}>{h.d}</span>
                    <span style={{ fontSize: "12px", color: T.muted }}>{h.h}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{
            borderTop: `1px solid ${T.border}`, paddingTop: "20px",
            display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px",
          }}>
            <span style={{ fontSize: "11px", color: T.dim }}>
              © 2026 AutoNova Seminovos — Todos os direitos reservados
            </span>
            <span style={{ fontSize: "10px", fontFamily: "monospace", color: T.dim }}>
              demo powered by Atomo Car Cockpit
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── Vehicle card (grid) ─── */
function VehicleCard({ vehicle: v }: { vehicle: (typeof mockVehicles)[0] }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: "16px", overflow: "hidden",
        border: `1px solid ${hov ? T.borderHov : T.border}`,
        background: hov ? T.cardHov : T.card,
        transition: "all .22s", cursor: "pointer",
        transform: hov ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hov ? `0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(37,99,235,0.2)` : "none",
      }}
    >
      {/* Photo */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        <img
          src={v.mainImage}
          alt={`${v.brand} ${v.model}`}
          style={{
            width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block",
            transition: "transform .4s",
            transform: hov ? "scale(1.04)" : "scale(1)",
          }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(4,16,31,0.8) 0%, transparent 60%)",
        }} />
        {v.isFeatured && (
          <div style={{
            position: "absolute", top: "10px", left: "10px",
            background: T.blue, color: "#fff",
            fontSize: "9px", fontWeight: 700, letterSpacing: "0.12em",
            padding: "3px 9px", borderRadius: "999px", textTransform: "uppercase",
          }}>
            Destaque
          </div>
        )}
        <div style={{
          position: "absolute", bottom: "10px", right: "10px",
          background: "rgba(4,16,31,0.8)", backdropFilter: "blur(8px)",
          border: `1px solid ${T.border}`, borderRadius: "8px",
          padding: "5px 10px",
        }}>
          <span style={{ fontSize: "14px", fontWeight: 800, color: T.blue }}>
            {fmtPrice(v.price)}
          </span>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: "16px 18px" }}>
        <div style={{ fontSize: "10px", color: T.dim, marginBottom: "3px", letterSpacing: "0.05em" }}>
          {v.brand} · {v.yearModel}
        </div>
        <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "10px", letterSpacing: "-0.01em" }}>
          {v.model} <span style={{ fontWeight: 400, color: T.muted }}>{v.version}</span>
        </h3>

        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "14px" }}>
          {[fmtKm(v.mileage), TRANS[v.transmission] ?? v.transmission, FUEL[v.fuel] ?? v.fuel].map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: "10px", padding: "3px 9px", borderRadius: "999px",
                border: `1px solid ${T.border}`, color: T.muted,
                background: "rgba(255,255,255,0.03)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        <a
          href="#"
          style={{
            display: "block", textAlign: "center",
            padding: "9px 16px", borderRadius: "10px",
            background: hov ? T.blue : "rgba(37,99,235,0.12)",
            border: `1px solid ${hov ? T.blue : "rgba(37,99,235,0.2)"}`,
            color: hov ? "#fff" : T.blueLt,
            fontSize: "12px", fontWeight: 600, textDecoration: "none",
            transition: "all .22s",
          }}
        >
          Ver veículo completo
        </a>
      </div>
    </div>
  );
}

/* ─── Featured card (wider) ─── */
function FeaturedCard({ vehicle: v }: { vehicle: (typeof mockVehicles)[0] }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: "18px", overflow: "hidden",
        border: `1px solid ${hov ? "rgba(37,99,235,0.45)" : T.border}`,
        background: T.card, transition: "all .22s", cursor: "pointer",
        transform: hov ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hov ? `0 20px 60px rgba(0,0,0,0.5)` : "none",
      }}
    >
      <div style={{ position: "relative" }}>
        <img
          src={v.mainImage}
          alt={`${v.brand} ${v.model}`}
          style={{
            width: "100%", aspectRatio: "16/8", objectFit: "cover", display: "block",
            transition: "transform .4s",
            transform: hov ? "scale(1.03)" : "scale(1)",
          }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(8,22,40,0.92) 0%, transparent 55%)",
        }} />
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px",
        }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "10px", color: T.muted, marginBottom: "2px" }}>
                {v.brand} {v.yearModel}
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.02em" }}>
                {v.model} {v.version}
              </h3>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "9px", color: T.dim }}>A partir de</div>
              <div style={{ fontSize: "22px", fontWeight: 800, color: T.blue }}>{fmtPrice(v.price)}</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: "6px" }}>
          {[fmtKm(v.mileage), TRANS[v.transmission] ?? v.transmission].map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: "10px", padding: "3px 9px", borderRadius: "999px",
                border: `1px solid ${T.border}`, color: T.muted,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
        <a
          href="#"
          style={{
            display: "flex", alignItems: "center", gap: "5px",
            fontSize: "12px", fontWeight: 600, color: hov ? "#fff" : T.blueLt,
            textDecoration: "none", transition: "color .2s",
          }}
        >
          Ver detalhes
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </a>
      </div>
    </div>
  );
}
