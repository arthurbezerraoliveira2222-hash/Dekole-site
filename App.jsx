import React, { useState, useEffect, useCallback } from "react";
import {
  Menu, X, Search, MessageCircle, Instagram, Facebook, Music2,
  ArrowRight, ArrowLeft, Lock, LayoutDashboard, Plus,
  Pencil, Trash2, Eye, EyeOff, Save, GraduationCap, Sparkles,
  CheckCircle2, Clock, Award, Users, Briefcase, ListChecks,
  LogOut, Filter, HelpCircle, Zap, Globe, ChevronDown, Link2,
  ArrowUp, ArrowDown, Settings, ImagePlus, ShieldAlert, Wallet, CalendarClock
} from "lucide-react";

/* ==================================================================== */
/* STORAGE ADAPTER — usa window.storage (ambiente Claude) e cai para    */
/* localStorage automaticamente quando o site roda fora do Claude, para */
/* permitir hospedar o projeto em qualquer lugar.                       */
/* ==================================================================== */

const HAS_CLAUDE_STORAGE = typeof window !== "undefined" && window.storage && typeof window.storage.get === "function";

async function storageGet(key, shared) {
  if (HAS_CLAUDE_STORAGE) {
    try {
      const r = await window.storage.get(key, shared);
      return r ? r.value : null;
    } catch (e) { return null; }
  }
  try { return window.localStorage.getItem(key); } catch (e) { return null; }
}

async function storageSet(key, value, shared) {
  if (HAS_CLAUDE_STORAGE) {
    try { await window.storage.set(key, value, shared); return true; } catch (e) { return false; }
  }
  try { window.localStorage.setItem(key, value); return true; } catch (e) { return false; }
}

/* ==================================================================== */
/* CONFIG PADRÃO (editável pela Área ADM > Configurações)               */
/* ==================================================================== */

const CONFIG_KEY = "dekole_config_v1";
const COURSES_KEY = "dekole_courses_v2";
const ADMIN_PASSWORD_KEY = "dekole_admin_pass_v1";
const DEFAULT_ADMIN_PASSWORD = "dekole2026";

function digitsFromPhone(raw) {
  let d = (raw || "").replace(/\D/g, "");
  if (d.length <= 11 && !d.startsWith("55")) d = "55" + d;
  return d;
}

const DEFAULT_CONFIG = {
  companyName: "Centro de Ensino DEKOLE",
  tagline: "Cursos para impulsionar sua carreira e seu futuro!",
  phoneDisplay: "69 9353-6012",
  instagramHandle: "@escoladekole",
  instagramUrl: "https://instagram.com/escoladekole",
  facebookUrl: "https://facebook.com/escoladekole",
  tiktokUrl: "https://tiktok.com/@escoladekole",
  website: "www.dekole.com.br",
  aboutText: "O Centro de Ensino DEKOLE forma profissionais para o mercado de trabalho com cursos atualizados e certificação reconhecida. Da administração à tecnologia, do design ao empreendedorismo — aqui você encontra o caminho para transformar seu futuro.",
  paymentInfo: "Pagamento a combinar de acordo com as necessidades do cliente.",
  flexibilityInfo: "Você pode combinar a quantidade de dias em que deseja realizar o curso, de acordo com sua disponibilidade e necessidade.",
};

function waLink(digits, message) {
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

const CATEGORIES = [
  "Administração", "Tecnologia", "Design", "Marketing",
  "Negócios", "Informática", "Cursos para crianças", "Outros",
];

const CATEGORY_STYLE = {
  "Administração": { grad: "linear-gradient(135deg,#3b1f66,#7c3aed)" },
  "Tecnologia": { grad: "linear-gradient(135deg,#0e2a4a,#0891b2)" },
  "Design": { grad: "linear-gradient(135deg,#4a0e3f,#d946ef)" },
  "Marketing": { grad: "linear-gradient(135deg,#3a0e4a,#ec4899)" },
  "Negócios": { grad: "linear-gradient(135deg,#1e1b4b,#7c3aed)" },
  "Informática": { grad: "linear-gradient(135deg,#0c1f3d,#2563eb)" },
  "Cursos para crianças": { grad: "linear-gradient(135deg,#4a0e3f,#f472b6)" },
  "Outros": { grad: "linear-gradient(135deg,#1f1533,#6d28d9)" },
};

function slugify(s) {
  return (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
let _id = 1;
function nextId(prefix) { return `${prefix}${_id++}_${Date.now().toString(36)}`; }

/* ==================================================================== */
/* EXPLICAÇÕES PADRÃO DOS MÓDULOS — usadas para montar os cursos-base.  */
/* O ADM pode editar cada explicação individualmente depois.            */
/* ==================================================================== */

const CONTENT_DESC = {
  "Técnica de Vendas": "Estratégias e técnicas para conduzir uma venda do início ao fechamento, identificando as necessidades do cliente.",
  "Técnicas de Vendas": "Estratégias e técnicas para conduzir uma venda do início ao fechamento, identificando as necessidades do cliente.",
  "Marketing Pessoal": "Como construir e comunicar sua imagem profissional para se destacar no mercado de trabalho.",
  "Marketing Digital": "Estratégias para divulgar produtos e serviços na internet, usar redes sociais, criar campanhas e alcançar clientes.",
  "Telemarketing": "Técnicas de atendimento e comunicação por telefone para vendas, suporte e relacionamento com o cliente.",
  "Gestão Administrativa": "Organização e controle das rotinas administrativas de uma empresa, do planejamento à execução.",
  "Empreendedorismo": "Como planejar, estruturar e conduzir um negócio próprio, da ideia à prática.",
  "Facebook Business": "Uso da plataforma Facebook Business para criar páginas, anúncios e gerenciar a presença comercial da empresa.",
  "WhatsApp Business": "Uso do WhatsApp Business para atendimento, catálogo de produtos e vendas pelo aplicativo.",
  "Liderança Eficaz": "Habilidades para liderar equipes, tomar decisões e motivar pessoas no ambiente de trabalho.",
  "IA nos Negócios": "Como aplicar ferramentas de inteligência artificial no dia a dia de uma empresa para ganhar produtividade.",
  "IA nos Negócios Fast": "Introdução prática e rápida ao uso de inteligência artificial no dia a dia de uma empresa.",
  "Aplicativos de Chamada": "Uso de aplicativos de videochamada e reuniões online no ambiente profissional.",
  "ChatGPT": "Como usar o ChatGPT como ferramenta de apoio para escrever textos, organizar ideias e agilizar tarefas do dia a dia.",
  "Logística": "Noções de organização, transporte e controle de estoque dentro de uma empresa.",
  "Administrativo Informatizado": "Uso de ferramentas e sistemas informatizados nas rotinas administrativas do dia a dia.",
  "Assistente Contábil": "Rotinas básicas de apoio à área contábil de uma empresa.",
  "Matemática Financeira": "Cálculos financeiros usados no dia a dia do trabalho, como juros, porcentagem e descontos.",
  "Técnicas de Memorização": "Métodos práticos para memorizar informações com mais facilidade e agilidade.",
  "Excel 2019": "Uso do Microsoft Excel para criar planilhas, fórmulas e organizar dados.",
  "Departamento Pessoal": "Rotinas do setor de departamento pessoal, como controle de documentos e informações dos funcionários.",
  "Armazenamento em Nuvem": "Uso de serviços de armazenamento em nuvem para guardar, organizar e compartilhar arquivos.",
  "Excel Dashboard": "Criação de painéis visuais no Excel para acompanhar indicadores e dados de forma prática.",
  "Segurança Digital": "Boas práticas para proteger informações, senhas e dispositivos no ambiente digital.",
  "Documentos Google": "Uso das ferramentas do Google (Documentos, Planilhas, Apresentações) no dia a dia de trabalho.",
  "Gestão de R.H.": "Noções de gestão de pessoas e rotinas do setor de recursos humanos.",
  "Digitação": "Técnicas para digitar com mais velocidade e precisão.",
  "Inteligência Artificial Fast": "Introdução prática e rápida ao uso de ferramentas de inteligência artificial.",
  "Normas da ABNT": "Regras da ABNT para formatação de documentos e trabalhos escritos.",
  "Windows 11 Fast": "Introdução prática e rápida ao sistema operacional Windows 11.",
  "Windows 11": "Uso do sistema operacional Windows 11 no dia a dia de trabalho.",
  "Power BI": "Uso do Power BI para organizar dados e criar relatórios visuais.",
  "Word Fast": "Introdução prática e rápida ao Microsoft Word para criação de documentos.",
  "Photoshop CC": "Edição e criação de imagens usando o Adobe Photoshop.",
  "Corel Draw X8": "Criação de artes e ilustrações vetoriais usando o CorelDRAW.",
  "Illustrator CC": "Criação de ilustrações e artes vetoriais usando o Adobe Illustrator.",
  "Ambientes Digitais": "Familiarização com os principais ambientes e ferramentas digitais usados no dia a dia.",
  "Canva": "Criação de artes e materiais gráficos de forma prática usando o Canva.",
  "Java Básico": "Primeiros passos na lógica de programação usando a linguagem Java.",
  "HTML e CSS": "Estrutura e estilização de páginas para a criação de sites.",
  "Programação PHP": "Introdução à linguagem PHP para o desenvolvimento de sites e sistemas web.",
  "WordPress": "Criação e gerenciamento de sites usando a plataforma WordPress.",
  "After Effects CC": "Criação de animações e efeitos visuais usando o Adobe After Effects.",
  "Premier CC": "Edição de vídeos usando o Adobe Premiere.",
  "Windows 11 Kids": "Introdução ao Windows 11 de forma simples e adequada para crianças.",
  "Ambientes Digital Kids": "Primeiros contatos com ambientes digitais de forma segura e lúdica para crianças.",
  "Word Kids": "Introdução ao Microsoft Word de forma simples e divertida para crianças.",
  "Introdução à Informática": "Primeiros passos no uso do computador e das ferramentas básicas de informática.",
  "PowerPoint Kids": "Introdução à criação de apresentações de forma simples e divertida para crianças.",
  "Youtuber": "Noções básicas sobre criação e gravação de vídeos para internet.",
  "Criador de Conteúdo Kids": "Primeiros passos na criação de conteúdo digital de forma criativa e segura para crianças.",
  "Internet Kids": "Uso seguro e responsável da internet, voltado para o público infantil.",
  "Operador de Caixa": "Rotinas e boas práticas para atuar na operação de caixa em comércios e estabelecimentos.",
};

function mkContent(names) {
  return names.map((name) => ({
    id: nextId("m"),
    name,
    description: CONTENT_DESC[name] || "Descrição deste módulo ainda não cadastrada.",
  }));
}

/* ==================================================================== */
/* CURSOS-BASE — somente dados presentes nos banners fornecidos          */
/* ==================================================================== */

function makeCourse(partial) {
  return {
    id: nextId("c"),
    slug: slugify(partial.name),
    category: "Outros",
    duration: null,
    modality: null,
    schedule: null,
    subtitle: null,
    message: null,
    description: null,
    content: [],
    certification: null,
    highlights: [],
    areas: [],
    internship: null,
    practicalClasses: null,
    faq: [],
    image: null,
    ctaLabel: "Tenho interesse",
    status: "published",
    order: 0,
    ...partial,
  };
}

const DETAILED = [
  makeCourse({
    name: "Empreendedorismo", category: "Negócios", duration: "14 meses",
    content: mkContent(["Técnica de Vendas","Marketing Pessoal","Marketing Digital","Telemarketing","Gestão Administrativa","Empreendedorismo","Facebook Business","WhatsApp Business","Liderança Eficaz","IA nos Negócios","Aplicativos de Chamada","ChatGPT","Logística"]),
    certification: "Certificado reconhecido",
    highlights: ["Certificado reconhecido","Cursos atualizados com o mercado"],
  }),
  makeCourse({
    name: "Assistente Contábil", category: "Administração", duration: "19 meses",
    content: mkContent(["Administrativo Informatizado","Assistente Contábil","Matemática Financeira","Técnicas de Memorização","Excel 2019","Departamento Pessoal","Armazenamento em Nuvem","Excel Dashboard","Segurança Digital","Documentos Google","Gestão de R.H.","Digitação","Inteligência Artificial Fast","ChatGPT","Empreendedorismo","Aplicativos de Chamada"]),
    certification: "Certificado reconhecido",
    highlights: ["Certificado reconhecido","Cursos atualizados com o mercado"],
  }),
  makeCourse({
    name: "Assistente de Escritório", category: "Administração", duration: "19 meses",
    content: mkContent(["Telemarketing","Matemática Financeira","Técnicas de Memorização","Excel Dashboard","Marketing Pessoal","Liderança Eficaz","Gestão Administrativa","Gestão de R.H.","Departamento Pessoal","Documentos Google","Normas da ABNT","Administrativo Informatizado","Windows 11 Fast","WhatsApp Business","Power BI","Digitação","IA nos Negócios Fast","ChatGPT","Aplicativos de Chamada"]),
    certification: "Certificado reconhecido",
    highlights: ["Certificado reconhecido","Cursos atualizados com o mercado"],
  }),
  makeCourse({
    name: "Assistente Administrativo", category: "Administração", duration: "17 meses",
    content: mkContent(["Gestão Administrativa","Aplicativos de Chamada","Gestão de R.H.","Empreendedorismo","Excel 2019","Armazenamento em Nuvem","Excel Dashboard","Segurança Digital","Marketing Digital","Power BI","Administrativo Informatizado","Documentos Google","Word Fast","IA nos Negócios","ChatGPT","Digitação"]),
    certification: "Certificado reconhecido",
    highlights: ["Certificado reconhecido","Cursos atualizados com o mercado"],
  }),
  makeCourse({
    name: "Designer Gráfico", category: "Design", duration: "14 meses",
    subtitle: "Do básico ao avançado para o seu futuro!",
    message: "Domine as ferramentas mais desejadas do mercado e transforme ideias em resultados reais.",
    content: mkContent(["Photoshop CC","Corel Draw X8","Illustrator CC","Ambientes Digitais","Marketing Digital","Marketing Pessoal","Canva","IA nos Negócios","ChatGPT","Empreendedorismo"]),
    highlights: ["Aprenda na prática","Evolua suas habilidades","Certificado reconhecido","Prepare-se para o mercado"],
  }),
  makeCourse({
    name: "Web Designer Premium", category: "Tecnologia", duration: "16 meses",
    subtitle: "Do básico ao avançado para o seu futuro!",
    message: "Crie. Desenvolva. Transforme. Construa o futuro com tecnologia.",
    content: mkContent(["Java Básico","HTML e CSS","Programação PHP","Photoshop CC","Armazenamento em Nuvem","WordPress","Marketing Digital","Segurança Digital","ChatGPT","Inteligência Artificial Fast","Empreendedorismo"]),
    highlights: ["Aprenda na prática","Evolua suas habilidades","Certificado reconhecido","Prepare-se para o mercado"],
  }),
  makeCourse({
    name: "Edição e Designer de Vídeos", category: "Design", duration: "16 meses",
    subtitle: "Do básico ao avançado para o seu futuro!",
    message: "Criatividade que produz. Conhecimento que transforma.",
    content: mkContent(["Marketing Digital","After Effects CC","Corel Draw X8","Armazenamento em Nuvem","Premier CC","Photoshop CC","Marketing Pessoal","Segurança Digital","Canva","ChatGPT","Inteligência Artificial Fast"]),
    highlights: ["Aprenda na prática","Evolua suas habilidades","Certificado reconhecido","Prepare-se para o mercado"],
  }),
  makeCourse({
    name: "Youtuber Kids", category: "Cursos para crianças", duration: "13 meses",
    message: "Seu filho gosta de gravar vídeos sobre jogos ou sobre o dia a dia? Transforme esse interesse em futuro!",
    content: mkContent(["Windows 11 Kids","Ambientes Digital Kids","Word Kids","Introdução à Informática","PowerPoint Kids","Youtuber","Criador de Conteúdo Kids","Digitação","Internet Kids"]),
    highlights: ["Aprendizado divertido","Desenvolve criatividade","Preparado para o futuro"],
    ctaLabel: "Quero conhecer o curso",
  }),
  makeCourse({
    name: "Operador de Caixa", category: "Negócios", duration: "14 meses",
    message: "Já pensou em melhorar seu currículo e ganhar aqueles pontos na entrevista de emprego?",
    content: mkContent(["Técnicas de Vendas","Operador de Caixa","Excel 2019","Telemarketing","Matemática Financeira","Técnicas de Memorização","Excel Dashboard","Marketing Pessoal","Liderança Eficaz","Windows 11","Segurança Digital","Digitação","WhatsApp Business"]),
    highlights: ["Certificado reconhecido","Curso completo e atualizado"],
  }),
];

const AREA_ADMIN_STUBS = [
  "Atendente de Farmácia","Consultor de Vendas de Alta Performance","Gestão de Créditos e Cobranças",
  "Cuidador de Idoso","E-commerce","Gestão Estratégica de Empresas","Gestão e Planejamento Financeira",
  "Marketing e Divulgação Digital","Assistente em R.H. & DPT. Pessoal","Agente de Portaria",
  "Negócios Inteligentes","Síndico de Condomínio","Logística",
].map((name) => makeCourse({ name, category: "Administração" }));

const SEED_COURSES = [...DETAILED, ...AREA_ADMIN_STUBS].map((c, i) => ({ ...c, order: i }));

/* ==================================================================== */
/* GLOBAL STYLES                                                         */
/* ==================================================================== */

const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@600;800&family=Rajdhani:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
    .dekole * { box-sizing: border-box; }
    .dekole {
      --bg: #0a0714; --panel: #130d24; --panel2: #1a1230;
      --purple: #a855f7; --purple2: #7c3aed; --cyan: #22d3ee; --magenta: #ec4899;
      --text: #f3f0ff; --muted: #9d94bd; --line: rgba(168,85,247,0.22);
      font-family: 'Inter', system-ui, sans-serif; background: var(--bg); color: var(--text);
      min-height: 100vh; overflow-x: hidden; position: relative;
    }
    .dekole .disp { font-family: 'Orbitron','Rajdhani',sans-serif; }
    .dekole .bgfx { position: fixed; inset: 0; z-index: 0; pointer-events: none;
      background: radial-gradient(ellipse 60% 40% at 15% 0%, rgba(124,58,237,0.35), transparent 60%),
                  radial-gradient(ellipse 50% 35% at 100% 20%, rgba(34,211,238,0.18), transparent 60%),
                  radial-gradient(ellipse 50% 40% at 50% 100%, rgba(236,72,153,0.16), transparent 60%); }
    .dekole a { color: inherit; text-decoration: none; cursor: pointer; }
    .dekole button { font-family: inherit; cursor: pointer; }
    .dekole ::selection { background: var(--purple2); color: white; }
    .dekole .container { max-width: 1160px; margin: 0 auto; padding: 0 18px; position: relative; z-index: 1; }

    .dekole .glow-btn { display: inline-flex; align-items: center; gap: 8px; padding: 13px 24px; border-radius: 999px; border: none;
      font-weight: 700; font-size: 15px; background: linear-gradient(135deg, var(--purple2), var(--magenta)); color: white;
      box-shadow: 0 0 0 1px rgba(255,255,255,0.06), 0 8px 24px -6px rgba(168,85,247,0.55); transition: all .18s ease; }
    .dekole .glow-btn:hover { transform: translateY(-2px); filter: brightness(1.08); }
    .dekole .glow-btn:disabled { opacity: .6; cursor: not-allowed; transform: none; }
    .dekole .wa-btn { display: inline-flex; align-items: center; gap: 8px; padding: 13px 22px; border-radius: 999px;
      background: rgba(34,211,238,0.08); color: var(--cyan); border: 1.5px solid rgba(34,211,238,0.45); font-weight: 700; font-size: 15px; transition: all .18s ease; }
    .dekole .wa-btn:hover { background: rgba(34,211,238,0.16); border-color: var(--cyan); transform: translateY(-2px); }
    .dekole .ghost-btn { display: inline-flex; align-items: center; gap: 6px; padding: 10px 18px; border-radius: 999px;
      background: transparent; border: 1.5px solid var(--line); color: var(--text); font-weight: 600; font-size: 14px; transition: all .18s ease; }
    .dekole .ghost-btn:hover { border-color: var(--purple); background: rgba(168,85,247,0.08); }

    .dekole .hdr { position: sticky; top: 0; z-index: 40; backdrop-filter: blur(14px); background: rgba(10,7,20,0.72); border-bottom: 1px solid var(--line); }
    .dekole .hdr-inner { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; }
    .dekole .logo { display: flex; align-items: center; gap: 9px; font-weight: 800; font-size: 19px; background: none; border: none; padding: 0; color: var(--text); }
    .dekole .logo .mark { width: 34px; height: 34px; border-radius: 10px; display: grid; place-items: center;
      background: linear-gradient(135deg, var(--purple2), var(--cyan)); flex-shrink: 0; box-shadow: 0 0 18px rgba(168,85,247,0.55); }
    .dekole .nav-desktop { display: none; align-items: center; gap: 26px; font-weight: 600; font-size: 14.5px; color: var(--muted); }
    .dekole .nav-desktop a:hover { color: var(--text); }
    @media (min-width: 860px) { .dekole .nav-desktop { display: flex; } }
    .dekole .hdr-actions { display: flex; align-items: center; gap: 10px; }
    .dekole .wa-btn.nav-desktop { display: none; }
    @media (min-width: 860px) { .dekole .wa-btn.nav-desktop { display: inline-flex; } }
    .dekole .burger { display: inline-flex; padding: 8px; border-radius: 10px; background: var(--panel); border: 1px solid var(--line); }
    @media (min-width: 860px) { .dekole .burger { display: none; } }

    .dekole .mobile-menu { position: fixed; inset: 0; z-index: 50; background: rgba(6,4,12,0.75); backdrop-filter: blur(4px); display: flex; justify-content: flex-end; }
    .dekole .mobile-panel { width: 82%; max-width: 340px; height: 100%; background: var(--panel); border-left: 1px solid var(--line); padding: 20px; display: flex; flex-direction: column; gap: 4px; animation: slideIn .22s ease; }
    @keyframes slideIn { from { transform: translateX(100%);} to { transform: translateX(0);} }
    .dekole .mobile-panel a, .dekole .mobile-panel button.mm { padding: 14px 12px; border-radius: 12px; font-weight: 700; font-size: 16px; text-align: left; background: transparent; border: none; color: var(--text); }
    .dekole .mobile-panel a:active, .dekole .mobile-panel button.mm:active { background: var(--panel2); }

    .dekole .hero { padding: 56px 0 40px; position: relative; }
    .dekole .eyebrow { display: inline-flex; align-items: center; gap: 7px; font-size: 12.5px; font-weight: 700; letter-spacing: 1.6px; text-transform: uppercase; color: var(--cyan);
      padding: 7px 14px; border-radius: 999px; border: 1px solid rgba(34,211,238,0.35); background: rgba(34,211,238,0.06); }
    .dekole .hero h1 { font-size: clamp(32px,8vw,54px); line-height: 1.05; font-weight: 800; margin: 18px 0 14px;
      background: linear-gradient(100deg,#fff 10%, var(--purple) 50%, var(--cyan) 90%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
    .dekole .hero p.lead { font-size: 17px; color: var(--muted); max-width: 480px; margin-bottom: 26px; line-height: 1.55; }
    .dekole .hero-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 30px; }
    .dekole .scanline { height: 2px; width: 100%; margin: 30px 0; background: linear-gradient(90deg, transparent, var(--purple), var(--cyan), var(--magenta), transparent);
      background-size: 200% 100%; animation: scan 4.5s linear infinite; border-radius: 2px; opacity: .85; }
    @keyframes scan { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    .dekole .stat-row { display: flex; gap: 26px; flex-wrap: wrap; }
    .dekole .stat b { display: block; font-size: 24px; font-weight: 800; font-family: 'Orbitron'; }
    .dekole .stat span { font-size: 12.5px; color: var(--muted); }

    .dekole section.pad { padding: 46px 0; }
    .dekole .sec-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; margin-bottom: 22px; flex-wrap: wrap; }
    .dekole .sec-head h2 { font-size: clamp(22px,5vw,30px); font-weight: 800; }
    .dekole .sec-head .accent { color: var(--cyan); }
    .dekole .sec-head p { color: var(--muted); font-size: 14.5px; margin-top: 4px; }

    .dekole .grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
    @media (min-width: 620px) { .dekole .grid { grid-template-columns: 1fr 1fr; } }
    @media (min-width: 960px) { .dekole .grid { grid-template-columns: 1fr 1fr 1fr; } }

    .dekole .card { background: var(--panel); border: 1px solid var(--line); border-radius: 20px; overflow: hidden; display: flex; flex-direction: column; transition: all .2s ease; position: relative; }
    .dekole .card:hover { transform: translateY(-4px); border-color: rgba(168,85,247,0.55); box-shadow: 0 16px 40px -14px rgba(124,58,237,0.5); }
    .dekole .card-banner { height: 128px; position: relative; display: flex; align-items: flex-end; padding: 14px; background-size: cover; background-position: center; }
    .dekole .card-banner::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, transparent 40%, rgba(10,7,20,0.65)); }
    .dekole .card-banner .cat-chip { position: relative; z-index: 1; font-size: 11px; font-weight: 700; padding: 5px 11px; border-radius: 999px; background: rgba(6,4,12,0.55); border: 1px solid rgba(255,255,255,0.25); backdrop-filter: blur(3px); }
    .dekole .card-body { padding: 16px; display: flex; flex-direction: column; gap: 8px; flex: 1; }
    .dekole .card-body h3 { font-size: 17px; font-weight: 700; line-height: 1.25; }
    .dekole .card-meta { display: flex; gap: 12px; flex-wrap: wrap; font-size: 12.5px; color: var(--muted); }
    .dekole .card-meta span { display: inline-flex; align-items: center; gap: 5px; }
    .dekole .card-desc { font-size: 13.5px; color: var(--muted); line-height: 1.5; flex: 1; }
    .dekole .card-cta { margin-top: 6px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 11px; border-radius: 12px; font-weight: 700; font-size: 14px;
      background: rgba(168,85,247,0.1); border: 1px solid rgba(168,85,247,0.4); color: var(--text); transition: all .18s ease; }
    .dekole .card-cta:hover { background: rgba(168,85,247,0.22); border-color: var(--purple); }

    .dekole .search-wrap { position: relative; margin-bottom: 16px; }
    .dekole .search-wrap input { width: 100%; padding: 14px 16px 14px 46px; border-radius: 16px; border: 1.5px solid var(--line); background: var(--panel); color: var(--text); font-size: 15px; outline: none; }
    .dekole .search-wrap input:focus { border-color: var(--purple); box-shadow: 0 0 0 3px rgba(168,85,247,0.18); }
    .dekole .search-wrap svg { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--muted); }
    .dekole .chip-row { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; margin-bottom: 22px; scrollbar-width: none; }
    .dekole .chip-row::-webkit-scrollbar { display: none; }
    .dekole .chip { flex-shrink: 0; padding: 9px 16px; border-radius: 999px; font-size: 13.5px; font-weight: 600; border: 1.5px solid var(--line); background: var(--panel); color: var(--muted); transition: all .15s ease; white-space: nowrap; }
    .dekole .chip.active { background: linear-gradient(135deg, var(--purple2), var(--magenta)); color: white; border-color: transparent; }
    .dekole .chip:hover:not(.active) { border-color: var(--purple); color: var(--text); }
    .dekole .empty { text-align: center; padding: 50px 16px; color: var(--muted); }

    .dekole .diff-grid { display: grid; grid-template-columns: 1fr; gap: 14px; }
    @media (min-width: 700px) { .dekole .diff-grid { grid-template-columns: repeat(3,1fr); } }
    .dekole .diff-card { background: var(--panel); border: 1px solid var(--line); border-radius: 18px; padding: 20px; }
    .dekole .diff-card .ic { width: 42px; height: 42px; border-radius: 12px; display: grid; place-items: center; margin-bottom: 12px; background: linear-gradient(135deg, var(--purple2), var(--cyan)); }
    .dekole .diff-card h4 { font-size: 15.5px; font-weight: 700; margin-bottom: 6px; }
    .dekole .diff-card p { font-size: 13.5px; color: var(--muted); line-height: 1.5; }

    .dekole .cta-band { border-radius: 24px; padding: 34px 22px; text-align: center; background: linear-gradient(135deg, rgba(124,58,237,0.25), rgba(34,211,238,0.12)); border: 1px solid var(--line); }
    .dekole .cta-band h3 { font-size: clamp(20px,5vw,28px); font-weight: 800; margin-bottom: 10px; }
    .dekole .cta-band p { color: var(--muted); margin-bottom: 20px; }

    .dekole footer { border-top: 1px solid var(--line); padding: 40px 0 26px; margin-top: 20px; }
    .dekole .foot-grid { display: grid; grid-template-columns: 1fr; gap: 26px; margin-bottom: 26px; }
    @media (min-width: 700px) { .dekole .foot-grid { grid-template-columns: 1.3fr 1fr 1fr; } }
    .dekole footer h5 { font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: var(--muted); margin-bottom: 12px; }
    .dekole .foot-links { display: flex; flex-direction: column; gap: 9px; font-size: 14.5px; }
    .dekole .foot-links a:hover { color: var(--cyan); }
    .dekole .social-row { display: flex; gap: 10px; margin-top: 10px; }
    .dekole .social-row a { width: 38px; height: 38px; border-radius: 11px; display: grid; place-items: center; background: var(--panel); border: 1px solid var(--line); }
    .dekole .social-row a:hover { border-color: var(--purple); color: var(--cyan); }
    .dekole .foot-bottom { text-align: center; font-size: 12.5px; color: var(--muted); padding-top: 20px; border-top: 1px solid var(--line); }

    .dekole .float-wa { position: fixed; bottom: 18px; right: 18px; z-index: 45; width: 58px; height: 58px; border-radius: 50%;
      background: linear-gradient(135deg,#22d3ee,#0891b2); display: grid; place-items: center; box-shadow: 0 8px 26px -6px rgba(34,211,238,0.65); animation: pulseWa 2.6s ease-in-out infinite; }
    @keyframes pulseWa { 0%,100% { box-shadow: 0 8px 26px -6px rgba(34,211,238,0.65);} 50% { box-shadow: 0 8px 34px -4px rgba(34,211,238,0.95);} }

    .dekole .back-link { display: inline-flex; align-items: center; gap: 6px; color: var(--muted); font-weight: 600; font-size: 14px; margin-bottom: 18px; background: none; border: none; }
    .dekole .back-link:hover { color: var(--cyan); }

    .dekole .detail-hero { border-radius: 22px; padding: 30px 22px; position: relative; overflow: hidden; margin-bottom: 26px; background-size: cover; background-position: center; }
    .dekole .detail-hero::before { content:''; position:absolute; inset:0; background: rgba(6,4,12,0.35); }
    .dekole .detail-hero-inner { position: relative; z-index: 1; }
    .dekole .detail-hero .cat-chip { display:inline-block; font-size: 11.5px; font-weight: 700; padding: 5px 12px; border-radius: 999px; background: rgba(6,4,12,0.5); border: 1px solid rgba(255,255,255,0.3); margin-bottom: 12px; }
    .dekole .detail-hero h1 { font-size: clamp(24px,6vw,36px); font-weight: 800; margin-bottom: 8px; }
    .dekole .detail-hero .sub { color: rgba(255,255,255,0.85); font-size: 15px; margin-bottom: 14px; }
    .dekole .detail-meta { display: flex; flex-wrap: wrap; gap: 10px; }
    .dekole .detail-meta span { display: inline-flex; align-items: center; gap: 6px; font-size: 13.5px; font-weight: 600; padding: 7px 13px; border-radius: 999px; background: rgba(6,4,12,0.45); border: 1px solid rgba(255,255,255,0.2); }

    .dekole .block { background: var(--panel); border: 1px solid var(--line); border-radius: 18px; padding: 20px; margin-bottom: 16px; }
    .dekole .block h3 { font-size: 16.5px; font-weight: 700; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
    .dekole .block h3 svg { color: var(--cyan); }
    .dekole .block p { color: var(--muted); font-size: 14.5px; line-height: 1.6; }
    .dekole .tag-list { display: flex; flex-wrap: wrap; gap: 8px; }
    .dekole .tag-list li { list-style: none; font-size: 13px; font-weight: 600; padding: 7px 13px; border-radius: 10px; background: var(--panel2); border: 1px solid var(--line); }
    .dekole .check-list { display: flex; flex-direction: column; gap: 9px; }
    .dekole .check-list li { list-style: none; display: flex; gap: 9px; font-size: 14px; color: var(--text); align-items: flex-start; }
    .dekole .check-list svg { color: #34d399; flex-shrink: 0; margin-top: 2px; }
    .dekole .faq-item { border-bottom: 1px solid var(--line); padding: 12px 0; }
    .dekole .faq-item:last-child { border-bottom: none; }
    .dekole .faq-q { font-weight: 700; font-size: 14.5px; margin-bottom: 5px; }
    .dekole .faq-a { font-size: 13.5px; color: var(--muted); line-height: 1.5; }
    .dekole .notice { font-size: 13px; color: var(--muted); font-style: italic; }
    .dekole .big-cta { display: flex; justify-content: center; margin: 24px 0 6px; }
    .dekole .big-cta .glow-btn { padding: 16px 34px; font-size: 16px; }

    /* Módulos interativos */
    .dekole .module-list { display: flex; flex-direction: column; gap: 8px; }
    .dekole .module-item { border: 1px solid var(--line); border-radius: 14px; overflow: hidden; background: var(--panel2); }
    .dekole .module-toggle { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 13px 16px; background: transparent; border: none; color: var(--text); font-weight: 700; font-size: 14px; text-align: left; }
    .dekole .module-item.open .module-toggle { color: var(--cyan); }
    .dekole .module-toggle svg.chev { transition: transform .2s ease; color: var(--muted); flex-shrink: 0; }
    .dekole .module-item.open .module-toggle svg.chev { transform: rotate(180deg); color: var(--cyan); }
    .dekole .module-panel { padding: 0 16px 14px; font-size: 13.5px; color: var(--muted); line-height: 1.55; animation: fadeDown .18s ease; }
    @keyframes fadeDown { from { opacity: 0; transform: translateY(-4px);} to { opacity: 1; transform: translateY(0);} }

    /* Admin */
    .dekole .admin-shell { min-height: 100vh; }
    .dekole .admin-login { max-width: 380px; margin: 60px auto; padding: 0 18px; }
    .dekole .field { margin-bottom: 16px; }
    .dekole .field label { display: block; font-size: 13px; font-weight: 700; color: var(--muted); margin-bottom: 7px; text-transform: uppercase; letter-spacing: .4px; }
    .dekole .field input, .dekole .field select, .dekole .field textarea { width: 100%; padding: 12px 14px; border-radius: 12px; border: 1.5px solid var(--line); background: var(--panel2); color: var(--text); font-size: 14.5px; outline: none; font-family: inherit; }
    .dekole .field input:focus, .dekole .field select:focus, .dekole .field textarea:focus { border-color: var(--purple); box-shadow: 0 0 0 3px rgba(168,85,247,0.18); }
    .dekole .field textarea { resize: vertical; min-height: 80px; }
    .dekole .field-hint { font-size: 12px; color: var(--muted); margin-top: 5px; }
    .dekole .field-row { display: grid; grid-template-columns: 1fr; gap: 14px; }
    @media (min-width: 640px) { .dekole .field-row.two { grid-template-columns: 1fr 1fr; } }

    .dekole .admin-topbar { display: flex; align-items: center; justify-content: space-between; padding: 16px 0; border-bottom: 1px solid var(--line); margin-bottom: 20px; flex-wrap: wrap; gap: 10px; }
    .dekole .admin-tabs { display: flex; gap: 8px; overflow-x: auto; margin-bottom: 22px; scrollbar-width: none; }
    .dekole .admin-tabs::-webkit-scrollbar { display: none; }
    .dekole .admin-tab { flex-shrink: 0; display: inline-flex; align-items: center; gap: 6px; padding: 9px 15px; border-radius: 999px; font-size: 13.5px; font-weight: 700; border: 1.5px solid var(--line); background: var(--panel); color: var(--muted); }
    .dekole .admin-tab.active { background: linear-gradient(135deg, var(--purple2), var(--cyan)); color: #0a0714; border-color: transparent; }
    .dekole .admin-stats { display: grid; grid-template-columns: repeat(2,1fr); gap: 12px; margin-bottom: 26px; }
    @media (min-width: 700px) { .dekole .admin-stats { grid-template-columns: repeat(4,1fr); } }
    .dekole .stat-card { background: var(--panel); border: 1px solid var(--line); border-radius: 16px; padding: 16px; }
    .dekole .stat-card b { font-size: 26px; font-weight: 800; font-family: 'Orbitron'; display: block; }
    .dekole .stat-card span { font-size: 12.5px; color: var(--muted); }

    .dekole .table-wrap { background: var(--panel); border: 1px solid var(--line); border-radius: 18px; overflow: hidden; }
    .dekole .arow { display: flex; align-items: center; gap: 10px; padding: 14px 16px; border-bottom: 1px solid var(--line); flex-wrap: wrap; }
    .dekole .arow:last-child { border-bottom: none; }
    .dekole .arow .thumb { width: 44px; height: 44px; border-radius: 10px; flex-shrink: 0; background-size: cover; background-position: center; }
    .dekole .arow .info { flex: 1; min-width: 120px; }
    .dekole .arow .info .n { font-weight: 700; font-size: 14.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .dekole .arow .info .c { font-size: 12.5px; color: var(--muted); }
    .dekole .status-pill { font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 999px; }
    .dekole .status-pill.pub { background: rgba(52,211,153,0.15); color: #34d399; border: 1px solid rgba(52,211,153,0.35); }
    .dekole .status-pill.hid { background: rgba(148,163,184,0.15); color: #94a3b8; border: 1px solid rgba(148,163,184,0.3); }
    .dekole .arow .actions { display: flex; gap: 6px; flex-shrink: 0; }
    .dekole .icon-btn { width: 34px; height: 34px; display: grid; place-items: center; border-radius: 9px; background: var(--panel2); border: 1px solid var(--line); color: var(--muted); flex-shrink: 0; }
    .dekole .icon-btn:hover { color: var(--text); border-color: var(--purple); }
    .dekole .icon-btn:disabled { opacity: .35; cursor: not-allowed; }

    .dekole .toast { position: fixed; bottom: 90px; left: 50%; transform: translateX(-50%); z-index: 60; background: var(--panel2); border: 1px solid var(--purple); padding: 12px 22px; border-radius: 999px; font-size: 14px; font-weight: 600; box-shadow: 0 10px 30px -8px rgba(0,0,0,0.6); animation: toastIn .25s ease; max-width: 90vw; text-align: center; }
    @keyframes toastIn { from { opacity:0; transform: translate(-50%,10px);} to { opacity:1; transform: translate(-50%,0);} }

    .dekole .repeater-item { display: flex; gap: 8px; margin-bottom: 8px; }
    .dekole .repeater-item input { flex: 1; }
    .dekole .add-line-btn { display: inline-flex; align-items: center; gap: 6px; font-size: 13.5px; font-weight: 700; color: var(--cyan); margin-top: 4px; background: none; border: none; }
    .dekole .module-edit-row { border: 1px solid var(--line); border-radius: 12px; padding: 12px; margin-bottom: 10px; display: flex; flex-direction: column; gap: 8px; position: relative; background: var(--panel2); }
    .dekole .module-edit-row .row-top { display: flex; gap: 8px; }
    .dekole .row-top input { flex: 1; }

    .dekole .form-actions { display: flex; gap: 10px; margin-top: 26px; flex-wrap: wrap; }
    .dekole .img-preview { width: 100%; max-width: 260px; height: 140px; border-radius: 14px; background-size: cover; background-position: center; border: 1px solid var(--line); margin-bottom: 10px; }
    .dekole .img-row { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
    .dekole .file-btn { display: inline-flex; align-items: center; gap: 6px; padding: 10px 16px; border-radius: 10px; background: var(--panel2); border: 1.5px solid var(--line); font-weight: 600; font-size: 13.5px; position: relative; overflow: hidden; }
    .dekole .file-btn input[type=file] { position: absolute; inset: 0; opacity: 0; cursor: pointer; }

    .dekole .warn-box { display: flex; gap: 12px; padding: 16px; border-radius: 14px; background: rgba(251,191,36,0.08); border: 1px solid rgba(251,191,36,0.35); margin-bottom: 20px; }
    .dekole .warn-box svg { color: #fbbf24; flex-shrink: 0; }
    .dekole .warn-box p { font-size: 13.5px; color: var(--muted); line-height: 1.55; margin: 0; }
    .dekole .warn-box b { color: var(--text); }

    .dekole .import-box { background: var(--panel); border: 1px solid var(--line); border-radius: 18px; padding: 22px; margin-bottom: 18px; }
    .dekole .import-row { display: flex; gap: 10px; flex-wrap: wrap; }
    .dekole .import-row input { flex: 1; min-width: 200px; }
    .dekole .divider-or { display: flex; align-items: center; gap: 12px; margin: 18px 0; color: var(--muted); font-size: 12.5px; font-weight: 700; text-transform: uppercase; }
    .dekole .divider-or::before, .dekole .divider-or::after { content: ''; flex: 1; height: 1px; background: var(--line); }
  `}</style>
);

/* ==================================================================== */
/* SMALL COMPONENTS                                                      */
/* ==================================================================== */

function Chip({ active, onClick, children }) {
  return <button className={`chip${active ? " active" : ""}`} onClick={onClick}>{children}</button>;
}

function bannerStyle(course, style) {
  return course.image ? { backgroundImage: `url(${course.image})` } : { background: style.grad };
}

function CourseCard({ course, onOpen }) {
  const style = CATEGORY_STYLE[course.category] || CATEGORY_STYLE["Outros"];
  return (
    <div className="card">
      <div className="card-banner" style={bannerStyle(course, style)}>
        <span className="cat-chip">{course.category}</span>
      </div>
      <div className="card-body">
        <h3>{course.name}</h3>
        <div className="card-meta">
          {course.duration && <span><Clock size={13} /> {course.duration}</span>}
          {course.modality && <span><Globe size={13} /> {course.modality}</span>}
        </div>
        <p className="card-desc">
          {course.description || (course.content.length > 0
            ? `Conteúdo inclui: ${course.content.slice(0, 3).map((c) => c.name).join(", ")}${course.content.length > 3 ? "..." : ""}`
            : "Mais informações em breve.")}
        </p>
        <button className="card-cta" onClick={() => onOpen(course.id)}>Ver curso <ArrowRight size={15} /></button>
      </div>
    </div>
  );
}

function ModuleAccordion({ items }) {
  const [open, setOpen] = useState(null);
  return (
    <div className="module-list">
      {items.map((m, i) => (
        <div className={`module-item${open === i ? " open" : ""}`} key={m.id || i}>
          <button className="module-toggle" onClick={() => setOpen(open === i ? null : i)}>
            <span>{m.name}</span>
            <ChevronDown className="chev" size={17} />
          </button>
          {open === i && <div className="module-panel">{m.description || "Descrição deste módulo em breve."}</div>}
        </div>
      ))}
    </div>
  );
}

function Header({ setView, menuOpen, setMenuOpen, goHome, config }) {
  const links = [
    { label: "Início", v: "home" }, { label: "Cursos", v: "courses" },
    { label: "Categorias", v: "courses" }, { label: "Sobre a DEKOLE", v: "about" }, { label: "Contato", v: "contact" },
  ];
  const msg = `Olá! Gostaria de saber mais sobre os cursos da ${config.companyName}.`;
  return (
    <header className="hdr">
      <div className="container hdr-inner">
        <button className="logo" onClick={goHome}>
          <span className="mark"><GraduationCap size={19} color="#0a0714" /></span>
          <span className="disp">DEKOLE</span>
        </button>
        <nav className="nav-desktop">{links.map((l) => <a key={l.label} onClick={() => setView(l.v)}>{l.label}</a>)}</nav>
        <div className="hdr-actions">
          <a className="wa-btn nav-desktop" href={waLink(config.whatsappDigits, msg)} target="_blank" rel="noopener noreferrer">
            <MessageCircle size={16} /> Fale pelo WhatsApp
          </a>
          <button className="burger" onClick={() => setMenuOpen(true)}><Menu size={22} /></button>
        </div>
      </div>
      {menuOpen && (
        <div className="mobile-menu" onClick={() => setMenuOpen(false)}>
          <div className="mobile-panel" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
              <button className="icon-btn" onClick={() => setMenuOpen(false)}><X size={18} /></button>
            </div>
            {links.map((l) => <button key={l.label} className="mm" onClick={() => { setView(l.v); setMenuOpen(false); }}>{l.label}</button>)}
            <a className="wa-btn" style={{ justifyContent: "center", marginTop: 14 }} href={waLink(config.whatsappDigits, msg)} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={16} /> Fale pelo WhatsApp
            </a>
            <button className="mm" style={{ marginTop: 20, color: "var(--muted)", fontSize: 13 }} onClick={() => { setView("admin"); setMenuOpen(false); }}>
              <Lock size={13} style={{ marginRight: 6, verticalAlign: -2 }} /> Painel administrativo
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

function Footer({ setView, config }) {
  const msg = `Olá! Gostaria de saber mais sobre os cursos da ${config.companyName}.`;
  return (
    <footer>
      <div className="container">
        <div className="foot-grid">
          <div>
            <div className="logo" style={{ marginBottom: 12 }}>
              <span className="mark"><GraduationCap size={19} color="#0a0714" /></span>
              <span className="disp">DEKOLE</span>
            </div>
            <p style={{ color: "var(--muted)", fontSize: 13.5, lineHeight: 1.6, maxWidth: 300 }}>{config.companyName} — {config.tagline}</p>
            <div className="social-row">
              <a href={config.instagramUrl} target="_blank" rel="noopener noreferrer"><Instagram size={17} /></a>
              <a href={config.facebookUrl} target="_blank" rel="noopener noreferrer"><Facebook size={17} /></a>
              <a href={config.tiktokUrl} target="_blank" rel="noopener noreferrer"><Music2 size={17} /></a>
              <a href={waLink(config.whatsappDigits, msg)} target="_blank" rel="noopener noreferrer"><MessageCircle size={17} /></a>
            </div>
          </div>
          <div>
            <h5>Navegação</h5>
            <div className="foot-links">
              <a onClick={() => setView("home")}>Início</a>
              <a onClick={() => setView("courses")}>Cursos</a>
              <a onClick={() => setView("about")}>Sobre a DEKOLE</a>
              <a onClick={() => setView("contact")}>Contato</a>
            </div>
          </div>
          <div>
            <h5>Contato</h5>
            <div className="foot-links">
              <span>WhatsApp: {config.phoneDisplay}</span>
              <span>{config.website}</span>
              <span>{config.instagramHandle}</span>
            </div>
          </div>
        </div>
        <div className="foot-bottom">
          © {new Date().getFullYear()} {config.companyName}. Todos os direitos reservados.
          <span style={{ marginLeft: 8, opacity: .6 }}>· <a onClick={() => setView("admin")}>Acesso ADM</a></span>
        </div>
      </div>
    </footer>
  );
}

/* ==================================================================== */
/* PUBLIC PAGES                                                          */
/* ==================================================================== */

function HomePage({ courses, setView, openCourse, config }) {
  const published = courses.filter((c) => c.status === "published").sort((a, b) => a.order - b.order);
  const featured = published.slice(0, 6);
  const catCounts = CATEGORIES.map((cat) => ({ cat, n: published.filter((c) => c.category === cat).length })).filter((c) => c.n > 0);
  const msg = `Olá! Gostaria de saber mais sobre os cursos da ${config.companyName}.`;

  return (
    <>
      <section className="hero">
        <div className="container">
          <span className="eyebrow"><Zap size={13} /> {config.companyName}</span>
          <h1 className="disp">APRENDA HOJE.<br />TRANSFORME AMANHÃ!</h1>
          <p className="lead">{config.tagline} Encontre o curso certo e comece sua transformação profissional hoje mesmo.</p>
          <div className="hero-actions">
            <button className="glow-btn" onClick={() => setView("courses")}>Conheça nossos cursos <ArrowRight size={17} /></button>
            <a className="wa-btn" href={waLink(config.whatsappDigits, msg)} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} /> Fale conosco</a>
          </div>
          <div className="scanline" />
          <div className="stat-row">
            <div className="stat"><b>{published.length}+</b><span>cursos disponíveis</span></div>
            <div className="stat"><b>{catCounts.length}</b><span>áreas de atuação</span></div>
            <div className="stat"><b>100%</b><span>certificação reconhecida</span></div>
          </div>
        </div>
      </section>

      <section className="pad">
        <div className="container">
          <div className="block" style={{ padding: 24 }}>
            <h3 style={{ marginBottom: 10 }}><Sparkles size={18} /> Sobre a DEKOLE</h3>
            <p>{config.aboutText}</p>
          </div>
        </div>
      </section>

      <section className="pad">
        <div className="container">
          <div className="sec-head">
            <div><h2>Encontre o curso <span className="accent">ideal para você</span></h2><p>Cursos com conteúdo direto das nossas turmas e materiais oficiais.</p></div>
            <button className="ghost-btn" onClick={() => setView("courses")}>Ver todos <ArrowRight size={14} /></button>
          </div>
          <div className="grid">{featured.map((c) => <CourseCard key={c.id} course={c} onOpen={openCourse} />)}</div>
        </div>
      </section>

      <section className="pad">
        <div className="container">
          <div className="sec-head"><div><h2>Nossos <span className="accent">diferenciais</span></h2></div></div>
          <div className="diff-grid">
            <div className="diff-card"><div className="ic"><Award size={20} color="#0a0714" /></div><h4>Certificado reconhecido</h4><p>Conclua seu curso com certificação válida em todo o território nacional.</p></div>
            <div className="diff-card"><div className="ic"><CalendarClock size={20} color="#0a0714" /></div><h4>Horários flexíveis</h4><p>Combine a duração e a rotina do curso de acordo com sua disponibilidade.</p></div>
            <div className="diff-card"><div className="ic"><Briefcase size={20} color="#0a0714" /></div><h4>Cursos atualizados com o mercado</h4><p>Conteúdo alinhado às ferramentas e tendências que as empresas exigem hoje.</p></div>
          </div>
        </div>
      </section>

      <section className="pad">
        <div className="container">
          <div className="cta-band">
            <h3 className="disp">Pronto para dar o próximo passo?</h3>
            <p>Fale agora com a equipe DEKOLE e garanta sua vaga.</p>
            <a className="glow-btn" href={waLink(config.whatsappDigits, `Olá! Gostaria de me matricular em um curso da ${config.companyName}.`)} target="_blank" rel="noopener noreferrer"><MessageCircle size={17} /> Falar no WhatsApp</a>
          </div>
        </div>
      </section>
    </>
  );
}

function CoursesPage({ courses, openCourse }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Todos");
  const published = courses.filter((c) => c.status === "published");
  const activeCats = CATEGORIES.filter((c) => published.some((p) => p.category === c));
  const filtered = published.filter((c) => {
    const matchesCat = cat === "Todos" || c.category === cat;
    const matchesQ = q.trim() === "" || c.name.toLowerCase().includes(q.toLowerCase()) || c.content.some((x) => x.name.toLowerCase().includes(q.toLowerCase()));
    return matchesCat && matchesQ;
  }).sort((a, b) => a.order - b.order);

  return (
    <section className="pad">
      <div className="container">
        <div className="sec-head"><div><h2>Nossos <span className="accent">Cursos</span></h2><p>Pesquise pelo nome ou pelo conteúdo que você quer aprender.</p></div></div>
        <div className="search-wrap"><Search size={18} /><input placeholder="Pesquisar curso (ex: Excel, Marketing, Design...)" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <div className="chip-row">
          <Chip active={cat === "Todos"} onClick={() => setCat("Todos")}><Filter size={12} style={{ marginRight: 5, verticalAlign: -1 }} />Todos</Chip>
          {activeCats.map((c) => <Chip key={c} active={cat === c} onClick={() => setCat(c)}>{c}</Chip>)}
        </div>
        {filtered.length === 0 ? <div className="empty">Nenhum curso encontrado para essa busca.</div> :
          <div className="grid">{filtered.map((c) => <CourseCard key={c.id} course={c} onOpen={openCourse} />)}</div>}
      </div>
    </section>
  );
}

function CourseDetailPage({ course, back, config }) {
  if (!course) return null;
  const style = CATEGORY_STYLE[course.category] || CATEGORY_STYLE["Outros"];
  const has = (v) => v !== null && v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0);
  const interestMsg = `Olá! Tenho interesse no curso ${course.name} e gostaria de receber mais informações.`;

  return (
    <section className="pad">
      <div className="container" style={{ maxWidth: 760 }}>
        <button className="back-link" onClick={back}><ArrowLeft size={15} /> Voltar aos cursos</button>

        <div className="detail-hero" style={bannerStyle(course, style)}>
          <div className="detail-hero-inner">
            <span className="cat-chip">{course.category}</span>
            <h1 className="disp">{course.name}</h1>
            {course.subtitle && <p className="sub">{course.subtitle}</p>}
            <div className="detail-meta">
              {course.duration && <span><Clock size={13} /> {course.duration}</span>}
              {course.modality && <span><Globe size={13} /> {course.modality}</span>}
              {course.schedule && <span>{course.schedule}</span>}
            </div>
          </div>
        </div>

        {has(course.message) && <div className="block"><p style={{ fontSize: 15.5, color: "var(--text)", fontStyle: "italic" }}>"{course.message}"</p></div>}
        {has(course.description) && <div className="block"><h3><Sparkles size={16} /> Sobre o curso</h3><p>{course.description}</p></div>}

        {has(course.content) && (
          <div className="block">
            <h3><ListChecks size={16} /> O que você vai aprender</h3>
            <ModuleAccordion items={course.content} />
          </div>
        )}

        {has(course.highlights) && (
          <div className="block">
            <h3><Award size={16} /> Diferenciais</h3>
            <ul className="check-list">{course.highlights.map((h, i) => <li key={i}><CheckCircle2 size={16} /> {h}</li>)}</ul>
          </div>
        )}

        <div className="block">
          <h3><GraduationCap size={16} /> Informações do curso</h3>
          <ul className="check-list">
            {has(course.certification) && <li><CheckCircle2 size={16} /> Certificação: {course.certification}</li>}
            {has(course.practicalClasses) && <li><CheckCircle2 size={16} /> Aulas práticas: {course.practicalClasses}</li>}
            {has(course.internship) && <li><CheckCircle2 size={16} /> Estágio: {course.internship}</li>}
            <li><Wallet size={16} /> Forma de pagamento: {config.paymentInfo}</li>
            <li><CalendarClock size={16} /> Flexibilidade: {config.flexibilityInfo}</li>
          </ul>
        </div>

        {has(course.areas) && <div className="block"><h3><Briefcase size={16} /> Áreas de atuação</h3><ul className="tag-list">{course.areas.map((a, i) => <li key={i}>{a}</li>)}</ul></div>}

        {has(course.faq) && (
          <div className="block">
            <h3><HelpCircle size={16} /> Perguntas frequentes</h3>
            {course.faq.map((f, i) => <div className="faq-item" key={i}><div className="faq-q">{f.q}</div><div className="faq-a">{f.a}</div></div>)}
          </div>
        )}

        {!has(course.duration) && !has(course.content) && !has(course.description) && (
          <div className="block"><p className="notice">As informações completas deste curso ainda estão sendo cadastradas. Fale com a nossa equipe pelo WhatsApp para saber mais.</p></div>
        )}

        <div className="big-cta">
          <a className="glow-btn" href={waLink(config.whatsappDigits, interestMsg)} target="_blank" rel="noopener noreferrer">
            <MessageCircle size={18} /> {course.ctaLabel.toUpperCase()}
          </a>
        </div>
      </div>
    </section>
  );
}

function AboutPage({ config }) {
  return (
    <section className="pad">
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="sec-head"><div><h2>Sobre a <span className="accent">DEKOLE</span></h2></div></div>
        <div className="block" style={{ padding: 24 }}><p style={{ fontSize: 15 }}>{config.aboutText}</p></div>
        <div className="diff-grid">
          <div className="diff-card"><div className="ic"><Award size={20} color="#0a0714" /></div><h4>Certificado reconhecido</h4><p>Válido em todo o território nacional.</p></div>
          <div className="diff-card"><div className="ic"><CalendarClock size={20} color="#0a0714" /></div><h4>Flexibilidade</h4><p>{config.flexibilityInfo}</p></div>
          <div className="diff-card"><div className="ic"><Briefcase size={20} color="#0a0714" /></div><h4>Foco em empregabilidade</h4><p>Conteúdo pensado para o seu próximo passo profissional.</p></div>
        </div>
      </div>
    </section>
  );
}

function ContactPage({ config }) {
  const msg = `Olá! Gostaria de falar com a equipe da ${config.companyName}.`;
  return (
    <section className="pad">
      <div className="container" style={{ maxWidth: 560 }}>
        <div className="sec-head"><div><h2>Fale com a <span className="accent">DEKOLE</span></h2><p>Estamos prontos para te ajudar a escolher o curso ideal.</p></div></div>
        <div className="block" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <a className="wa-btn" style={{ justifyContent: "center", padding: 16 }} href={waLink(config.whatsappDigits, msg)} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} /> WhatsApp: {config.phoneDisplay}</a>
          <div className="social-row" style={{ justifyContent: "center" }}>
            <a href={config.instagramUrl} target="_blank" rel="noopener noreferrer"><Instagram size={18} /></a>
            <a href={config.facebookUrl} target="_blank" rel="noopener noreferrer"><Facebook size={18} /></a>
            <a href={config.tiktokUrl} target="_blank" rel="noopener noreferrer"><Music2 size={18} /></a>
          </div>
          <p style={{ textAlign: "center", color: "var(--muted)", fontSize: 13.5 }}>{config.website} · {config.instagramHandle}</p>
        </div>
      </div>
    </section>
  );
}

/* ==================================================================== */
/* ADMIN                                                                  */
/* ==================================================================== */

function AdminLogin({ onLogin, back, adminPassword }) {
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const submit = (e) => {
    e.preventDefault();
    if (pass === adminPassword) onLogin();
    else setErr("Senha incorreta.");
  };
  return (
    <div className="admin-login">
      <button className="back-link" onClick={back}><ArrowLeft size={15} /> Voltar ao site</button>
      <div className="block" style={{ padding: 26, textAlign: "center" }}>
        <div style={{ width: 52, height: 52, borderRadius: 16, background: "linear-gradient(135deg,var(--purple2),var(--cyan))", display: "grid", placeItems: "center", margin: "0 auto 16px" }}>
          <Lock size={22} color="#0a0714" />
        </div>
        <h3 style={{ marginBottom: 4 }}>Painel Administrativo</h3>
        <p style={{ color: "var(--muted)", fontSize: 13.5, marginBottom: 20 }}>Acesso restrito à equipe DEKOLE</p>
        <form onSubmit={submit} style={{ textAlign: "left" }}>
          <div className="field">
            <label>Senha de acesso</label>
            <input type="password" value={pass} onChange={(e) => { setPass(e.target.value); setErr(""); }} placeholder="Digite a senha" autoFocus />
            {err && <div className="field-hint" style={{ color: "#f87171" }}>{err}</div>}
          </div>
          <button className="glow-btn" style={{ width: "100%", justifyContent: "center" }} type="submit">Entrar</button>
        </form>
      </div>
    </div>
  );
}

function AdminDashboard({ courses, setView, onEdit, onNew, onDelete, onToggleStatus, onMove, onLogout, onGoTab, tab }) {
  const published = courses.filter((c) => c.status === "published").length;
  const hidden = courses.length - published;
  const cats = new Set(courses.map((c) => c.category)).size;
  const sorted = [...courses].sort((a, b) => a.order - b.order);

  return (
    <div className="container" style={{ paddingTop: 20, paddingBottom: 60 }}>
      <div className="admin-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <LayoutDashboard size={20} color="var(--cyan)" />
          <b className="disp">Painel ADM · DEKOLE</b>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="ghost-btn" onClick={() => setView("home")}>Ver site</button>
          <button className="ghost-btn" onClick={onLogout}><LogOut size={14} /> Sair</button>
        </div>
      </div>

      <div className="admin-tabs">
        <button className={`admin-tab${tab === "dashboard" ? " active" : ""}`} onClick={() => onGoTab("dashboard")}><LayoutDashboard size={14} /> Cursos</button>
        <button className={`admin-tab${tab === "import" ? " active" : ""}`} onClick={() => onGoTab("import")}><Link2 size={14} /> Adicionar por link</button>
        <button className={`admin-tab${tab === "settings" ? " active" : ""}`} onClick={() => onGoTab("settings")}><Settings size={14} /> Configurações</button>
      </div>

      <div className="admin-stats">
        <div className="stat-card"><b>{courses.length}</b><span>Total de cursos</span></div>
        <div className="stat-card"><b style={{ color: "#34d399" }}>{published}</b><span>Publicados</span></div>
        <div className="stat-card"><b style={{ color: "#94a3b8" }}>{hidden}</b><span>Ocultos</span></div>
        <div className="stat-card"><b>{cats}</b><span>Categorias</span></div>
      </div>

      <div className="sec-head">
        <h2 style={{ fontSize: 20 }}>Gerenciar cursos</h2>
        <button className="glow-btn" onClick={onNew}><Plus size={16} /> Novo curso</button>
      </div>

      <div className="table-wrap">
        {sorted.map((c, idx) => {
          const style = CATEGORY_STYLE[c.category] || CATEGORY_STYLE["Outros"];
          return (
            <div className="arow" key={c.id}>
              <div className="thumb" style={bannerStyle(c, style)} />
              <div className="info">
                <div className="n">{c.name}</div>
                <div className="c">{c.category} {c.duration ? `· ${c.duration}` : ""}</div>
              </div>
              <span className={`status-pill ${c.status === "published" ? "pub" : "hid"}`}>{c.status === "published" ? "Publicado" : "Oculto"}</span>
              <div className="actions">
                <button className="icon-btn" title="Mover para cima" disabled={idx === 0} onClick={() => onMove(c.id, -1)}><ArrowUp size={14} /></button>
                <button className="icon-btn" title="Mover para baixo" disabled={idx === sorted.length - 1} onClick={() => onMove(c.id, 1)}><ArrowDown size={14} /></button>
                <button className="icon-btn" title={c.status === "published" ? "Ocultar" : "Publicar"} onClick={() => onToggleStatus(c.id)}>{c.status === "published" ? <Eye size={15} /> : <EyeOff size={15} />}</button>
                <button className="icon-btn" title="Editar" onClick={() => onEdit(c.id)}><Pencil size={15} /></button>
                <button className="icon-btn" title="Excluir" onClick={() => onDelete(c.id)}><Trash2 size={15} /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ListEditor({ label, items, setItems, placeholder }) {
  const update = (i, v) => setItems(items.map((x, idx) => (idx === i ? v : x)));
  const remove = (i) => setItems(items.filter((_, idx) => idx !== i));
  return (
    <div className="field">
      <label>{label}</label>
      {items.map((item, i) => (
        <div className="repeater-item" key={i}>
          <input value={item} onChange={(e) => update(i, e.target.value)} placeholder={placeholder} />
          <button type="button" className="icon-btn" onClick={() => remove(i)}><Trash2 size={14} /></button>
        </div>
      ))}
      <button type="button" className="add-line-btn" onClick={() => setItems([...items, ""])}><Plus size={14} /> Adicionar item</button>
    </div>
  );
}

function ModuleEditor({ items, setItems }) {
  const update = (i, key, v) => setItems(items.map((x, idx) => (idx === i ? { ...x, [key]: v } : x)));
  const remove = (i) => setItems(items.filter((_, idx) => idx !== i));
  const add = () => setItems([...items, { id: nextId("m"), name: "", description: "" }]);
  return (
    <div className="field">
      <label>Conteúdo programático (módulos)</label>
      {items.map((it, i) => (
        <div className="module-edit-row" key={it.id || i}>
          <div className="row-top">
            <input value={it.name} onChange={(e) => update(i, "name", e.target.value)} placeholder="Nome do módulo" />
            <button type="button" className="icon-btn" onClick={() => remove(i)}><Trash2 size={14} /></button>
          </div>
          <textarea value={it.description} onChange={(e) => update(i, "description", e.target.value)} placeholder="Explicação curta do que o aluno vai aprender neste módulo" style={{ minHeight: 56 }} />
        </div>
      ))}
      <button type="button" className="add-line-btn" onClick={add}><Plus size={14} /> Adicionar módulo</button>
    </div>
  );
}

function AdminCourseForm({ course, onSave, onCancel }) {
  const [form, setForm] = useState(() => ({ ...course }));
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) { alert("Imagem muito grande. Use um arquivo de até 4MB."); return; }
    const reader = new FileReader();
    reader.onload = () => set("image", reader.result);
    reader.readAsDataURL(file);
  };

  const submit = (e) => {
    e.preventDefault();
    const cleaned = {
      ...form,
      content: form.content.filter((x) => (x.name || "").trim() !== ""),
      highlights: form.highlights.filter((x) => x.trim() !== ""),
      areas: form.areas.filter((x) => x.trim() !== ""),
      slug: slugify(form.name || course.name),
    };
    onSave(cleaned);
  };

  return (
    <div className="container" style={{ paddingTop: 20, paddingBottom: 60, maxWidth: 700 }}>
      <button className="back-link" onClick={onCancel}><ArrowLeft size={15} /> Voltar ao painel</button>
      <h2 style={{ marginBottom: 18 }}>{course.name ? `Editar: ${course.name}` : "Novo curso"}</h2>
      <form onSubmit={submit}>
        <div className="field-row two">
          <div className="field"><label>Nome do curso *</label><input required value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
          <div className="field"><label>Categoria</label><select value={form.category} onChange={(e) => set("category", e.target.value)}>{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
        </div>

        <div className="field-row two">
          <div className="field"><label>Duração</label><input value={form.duration || ""} onChange={(e) => set("duration", e.target.value || null)} placeholder="ex: 14 meses" /></div>
          <div className="field"><label>Modalidade</label><input value={form.modality || ""} onChange={(e) => set("modality", e.target.value || null)} placeholder="ex: Online, EAD, Ao vivo" /></div>
        </div>

        <div className="field"><label>Horários</label><input value={form.schedule || ""} onChange={(e) => set("schedule", e.target.value || null)} /></div>

        <div className="field"><label>Certificação</label><input value={form.certification || ""} onChange={(e) => set("certification", e.target.value || null)} placeholder="ex: Certificado reconhecido" /></div>

        <div className="field"><label>Subtítulo (opcional)</label><input value={form.subtitle || ""} onChange={(e) => set("subtitle", e.target.value || null)} /></div>
        <div className="field"><label>Descrição completa</label><textarea value={form.description || ""} onChange={(e) => set("description", e.target.value || null)} /></div>
        <div className="field"><label>Mensagem / chamada de destaque</label><textarea value={form.message || ""} onChange={(e) => set("message", e.target.value || null)} /></div>

        <ModuleEditor items={form.content} setItems={(v) => set("content", v)} />
        <ListEditor label="Diferenciais / destaques" items={form.highlights} setItems={(v) => set("highlights", v)} placeholder="ex: Certificado reconhecido" />
        <ListEditor label="Áreas de atuação" items={form.areas} setItems={(v) => set("areas", v)} placeholder="ex: Escritórios, comércio..." />

        <div className="field-row two">
          <div className="field"><label>Aulas práticas</label><input value={form.practicalClasses || ""} onChange={(e) => set("practicalClasses", e.target.value || null)} placeholder="ex: exercícios práticos ao longo do curso" /></div>
          <div className="field"><label>Estágio</label><input value={form.internship || ""} onChange={(e) => set("internship", e.target.value || null)} /></div>
        </div>

        <div className="field">
          <label>Imagem / banner do curso</label>
          {form.image && <div className="img-preview" style={{ backgroundImage: `url(${form.image})` }} />}
          <div className="img-row">
            <label className="file-btn"><ImagePlus size={15} /> {form.image ? "Trocar imagem" : "Enviar imagem"}<input type="file" accept="image/*" onChange={handleImage} /></label>
            {form.image && <button type="button" className="ghost-btn" onClick={() => set("image", null)}>Remover imagem</button>}
          </div>
          <div className="field-hint">Sem imagem, o curso usa o degradê padrão da categoria. Prefira imagens leves (a área de armazenamento é limitada).</div>
        </div>

        <div className="field-row two">
          <div className="field"><label>Texto do botão de interesse</label><input value={form.ctaLabel} onChange={(e) => set("ctaLabel", e.target.value)} /></div>
          <div className="field"><label>Status</label><select value={form.status} onChange={(e) => set("status", e.target.value)}><option value="published">Publicado</option><option value="hidden">Oculto</option></select></div>
        </div>

        <div className="field-hint" style={{ marginBottom: 16 }}>Forma de pagamento e flexibilidade de dias aparecem automaticamente em todos os cursos, de acordo com o que está em Configurações.</div>

        <div className="form-actions">
          <button className="glow-btn" type="submit"><Save size={16} /> Salvar curso</button>
          <button className="ghost-btn" type="button" onClick={onCancel}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}

function AdminSettings({ config, onSave, onCancel, adminPassword, onChangePassword }) {
  const [form, setForm] = useState({ ...config });
  const [pass1, setPass1] = useState("");
  const [pass2, setPass2] = useState("");
  const [passMsg, setPassMsg] = useState("");
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e) => { e.preventDefault(); onSave(form); };
  const savePassword = (e) => {
    e.preventDefault();
    if (pass1.length < 6) { setPassMsg("Use uma senha com pelo menos 6 caracteres."); return; }
    if (pass1 !== pass2) { setPassMsg("As senhas não coincidem."); return; }
    onChangePassword(pass1);
    setPass1(""); setPass2(""); setPassMsg("Senha atualizada.");
  };

  return (
    <div className="container" style={{ paddingTop: 20, paddingBottom: 60, maxWidth: 700 }}>
      <button className="back-link" onClick={onCancel}><ArrowLeft size={15} /> Voltar ao painel</button>
      <h2 style={{ marginBottom: 6 }}>Configurações do site</h2>
      <p className="field-hint" style={{ marginBottom: 18 }}>Essas informações são usadas em todo o site — telefone, WhatsApp, redes sociais e textos institucionais.</p>

      <div className="warn-box">
        <ShieldAlert size={20} />
        <p><b>Sobre a segurança do painel:</b> esta é uma proteção simples por senha, pensada para uso interno da equipe. Como o site roda inteiramente no navegador (sem um servidor próprio), qualquer pessoa com conhecimento técnico consegue contornar essa senha inspecionando o código — e todos os cursos (inclusive os ocultos) trafegam para o navegador de qualquer visitante. Para uma segurança real quando o site for publicado com domínio próprio, o ideal é adicionar um backend com autenticação de verdade (por exemplo Supabase Auth, Firebase Auth ou uma API própria) guardando os cursos em um banco de dados protegido. Posso te ajudar a estruturar isso quando for para essa etapa.</p>
      </div>

      <form onSubmit={submit}>
        <div className="field-row two">
          <div className="field"><label>Nome da empresa</label><input value={form.companyName} onChange={(e) => set("companyName", e.target.value)} /></div>
          <div className="field"><label>Frase de efeito (tagline)</label><input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} /></div>
        </div>

        <div className="field"><label>Telefone / WhatsApp</label><input value={form.phoneDisplay} onChange={(e) => set("phoneDisplay", e.target.value)} placeholder="ex: 69 9353-6012" /></div>
        <div className="field-hint" style={{ marginTop: -10, marginBottom: 16 }}>Ao salvar, esse número é usado automaticamente em todos os botões de WhatsApp do site.</div>

        <div className="field-row two">
          <div className="field"><label>Instagram (usuário)</label><input value={form.instagramHandle} onChange={(e) => set("instagramHandle", e.target.value)} placeholder="@escoladekole" /></div>
          <div className="field"><label>Link do Instagram</label><input value={form.instagramUrl} onChange={(e) => set("instagramUrl", e.target.value)} /></div>
        </div>
        <div className="field-row two">
          <div className="field"><label>Link do Facebook</label><input value={form.facebookUrl} onChange={(e) => set("facebookUrl", e.target.value)} /></div>
          <div className="field"><label>Link do TikTok</label><input value={form.tiktokUrl} onChange={(e) => set("tiktokUrl", e.target.value)} /></div>
        </div>
        <div className="field"><label>Site</label><input value={form.website} onChange={(e) => set("website", e.target.value)} /></div>
        <div className="field"><label>Texto "Sobre a DEKOLE"</label><textarea value={form.aboutText} onChange={(e) => set("aboutText", e.target.value)} style={{ minHeight: 100 }} /></div>
        <div className="field"><label>Forma de pagamento (aparece em todos os cursos)</label><textarea value={form.paymentInfo} onChange={(e) => set("paymentInfo", e.target.value)} /></div>
        <div className="field"><label>Flexibilidade (aparece em todos os cursos)</label><textarea value={form.flexibilityInfo} onChange={(e) => set("flexibilityInfo", e.target.value)} /></div>

        <div className="form-actions"><button className="glow-btn" type="submit"><Save size={16} /> Salvar configurações</button></div>
      </form>

      <div className="block" style={{ marginTop: 30 }}>
        <h3><Lock size={16} /> Alterar senha do painel</h3>
        <form onSubmit={savePassword}>
          <div className="field-row two">
            <div className="field"><label>Nova senha</label><input type="password" value={pass1} onChange={(e) => setPass1(e.target.value)} /></div>
            <div className="field"><label>Confirmar nova senha</label><input type="password" value={pass2} onChange={(e) => setPass2(e.target.value)} /></div>
          </div>
          {passMsg && <div className="field-hint" style={{ marginBottom: 12 }}>{passMsg}</div>}
          <button className="ghost-btn" type="submit">Atualizar senha</button>
        </form>
      </div>
    </div>
  );
}

function AdminImport({ onImported, config, claudeEnv }) {
  const [url, setUrl] = useState("");
  const [pasted, setPasted] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const parseResponse = (data) => {
    const text = (data.content || []).map((b) => (b.type === "text" ? b.text : "")).filter(Boolean).join("\n");
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  };

  const buildDraft = (parsed) => makeCourse({
    name: parsed.name || "",
    category: CATEGORIES.includes(parsed.category) ? parsed.category : "Outros",
    duration: parsed.duration || null,
    modality: parsed.modality || null,
    description: parsed.description || null,
    content: Array.isArray(parsed.content) ? parsed.content.map((c) => ({ id: nextId("m"), name: c.name || "", description: c.description || "" })) : [],
    highlights: Array.isArray(parsed.highlights) ? parsed.highlights : [],
    areas: Array.isArray(parsed.areas) ? parsed.areas : [],
    status: "hidden",
  });

  const runImportUrl = async () => {
    if (!url.trim()) return;
    setLoading(true); setError("");
    try {
      const prompt = `Use a busca na web para acessar esta página e extrair informações de um curso profissionalizante nela descrito: ${url.trim()}
Responda APENAS com um objeto JSON válido, sem markdown e sem texto adicional, neste formato:
{"name":"","category":"","duration":"","modality":"","description":"","content":[{"name":"","description":""}],"highlights":[],"areas":[]}
Use somente informações realmente encontradas na página. Deixe campos vazios ("" ou []) quando a informação não estiver disponível. Não invente dados. A categoria deve ser uma destas: ${CATEGORIES.join(", ")}.`;
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1800, messages: [{ role: "user", content: prompt }], tools: [{ type: "web_search_20250305", name: "web_search" }] }),
      });
      const data = await res.json();
      const parsed = parseResponse(data);
      if (!parsed.name) throw new Error("empty");
      onImported(buildDraft(parsed));
    } catch (e) {
      setError("Não foi possível importar automaticamente desse link (o site pode bloquear leitura automática). Use a opção abaixo para colar as informações manualmente.");
    } finally { setLoading(false); }
  };

  const runImportText = async () => {
    if (!pasted.trim()) return;
    setLoading(true); setError("");
    try {
      const prompt = `A seguir estão informações coladas manualmente sobre um curso profissionalizante. Estruture essas informações no formato JSON abaixo, usando APENAS o que está no texto (não invente nada). Responda somente com o JSON, sem markdown.
{"name":"","category":"","duration":"","modality":"","description":"","content":[{"name":"","description":""}],"highlights":[],"areas":[]}
A categoria deve ser uma destas: ${CATEGORIES.join(", ")}.

Texto:
"""${pasted.trim()}"""`;
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1800, messages: [{ role: "user", content: prompt }] }),
      });
      const data = await res.json();
      const parsed = parseResponse(data);
      onImported(buildDraft(parsed));
    } catch (e) {
      setError("Não foi possível estruturar esse texto automaticamente. Tente novamente ou cadastre o curso manualmente em \"Novo curso\".");
    } finally { setLoading(false); }
  };

  return (
    <div className="container" style={{ paddingTop: 20, paddingBottom: 60, maxWidth: 700 }}>
      <h2 style={{ marginBottom: 6 }}>Adicionar curso por link</h2>
      <p className="field-hint" style={{ marginBottom: 18 }}>Cole o link de uma página com informações do curso. O sistema tenta importar os dados automaticamente — você revisa e edita tudo antes de publicar.</p>

      {!claudeEnv && (
        <div className="warn-box">
          <ShieldAlert size={20} />
          <p><b>Fora do ambiente do Claude, esta função precisa de configuração extra.</b> A importação automática usa a API da Anthropic, que só funciona sem chave própria dentro do Claude.ai. Depois de hospedar este site em outro lugar, você vai precisar criar um pequeno backend (proxy) com sua própria chave de API da Anthropic para essa função continuar funcionando — veja o README do projeto. Até lá, use a opção de colar as informações manualmente abaixo, ou cadastre o curso em "Novo curso".</p>
        </div>
      )}

      <div className="import-box">
        <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--muted)", marginBottom: 8, textTransform: "uppercase" }}>Link do curso</label>
        <div className="import-row">
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
          <button className="glow-btn" type="button" disabled={loading} onClick={runImportUrl}>{loading ? "Importando..." : <><Link2 size={15} /> Importar do link</>}</button>
        </div>

        <div className="divider-or">ou</div>

        <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--muted)", marginBottom: 8, textTransform: "uppercase" }}>Colar informações manualmente</label>
        <textarea value={pasted} onChange={(e) => setPasted(e.target.value)} placeholder="Cole aqui o texto com nome, duração, conteúdo programático, etc." style={{ minHeight: 120, marginBottom: 10 }} />
        <button className="ghost-btn" type="button" disabled={loading} onClick={runImportText}>{loading ? "Processando..." : "Importar deste texto"}</button>

        {error && <div className="field-hint" style={{ color: "#f87171", marginTop: 14 }}>{error}</div>}
      </div>

      <p className="field-hint">Alguns sites bloqueiam leitura automática por segurança. Nesses casos, colar o texto manualmente funciona melhor. O curso importado entra como <b>oculto</b> até você revisar e publicar.</p>
    </div>
  );
}

/* ==================================================================== */
/* APP ROOT                                                               */
/* ==================================================================== */

export default function App() {
  const [courses, setCourses] = useState(SEED_COURSES);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [adminPassword, setAdminPassword] = useState(DEFAULT_ADMIN_PASSWORD);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState("home");
  const [selectedId, setSelectedId] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminAuthed, setAdminAuthed] = useState(false);
  const [adminTab, setAdminTab] = useState("dashboard");
  const [editingId, setEditingId] = useState(null);
  const [draftImport, setDraftImport] = useState(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [rawCourses, rawConfig, rawPass] = await Promise.all([
        storageGet(COURSES_KEY, true), storageGet(CONFIG_KEY, true), storageGet(ADMIN_PASSWORD_KEY, true),
      ]);
      if (cancelled) return;
      if (rawCourses) { try { setCourses(JSON.parse(rawCourses)); } catch (_) {} }
      else { storageSet(COURSES_KEY, JSON.stringify(SEED_COURSES), true); }
      if (rawConfig) { try { setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(rawConfig) }); } catch (_) {} }
      else { storageSet(CONFIG_KEY, JSON.stringify(DEFAULT_CONFIG), true); }
      if (rawPass) { setAdminPassword(rawPass); }
      else { storageSet(ADMIN_PASSWORD_KEY, DEFAULT_ADMIN_PASSWORD, true); }
      setLoaded(true);
    })();
    const failsafe = setTimeout(() => setLoaded(true), 4000);
    return () => { cancelled = true; clearTimeout(failsafe); };
  }, []);

  const configWithDigits = { ...config, whatsappDigits: digitsFromPhone(config.phoneDisplay) };

  const persistCourses = useCallback(async (next) => { setCourses(next); storageSet(COURSES_KEY, JSON.stringify(next), true); }, []);
  const persistConfig = useCallback(async (next) => { setConfig(next); storageSet(CONFIG_KEY, JSON.stringify(next), true); }, []);
  const persistPassword = useCallback(async (next) => { setAdminPassword(next); storageSet(ADMIN_PASSWORD_KEY, next, true); }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2400); };
  const goHome = () => { setView("home"); window.scrollTo(0, 0); };
  const changeView = (v) => { setView(v); window.scrollTo(0, 0); };
  const openCourse = (id) => { setSelectedId(id); setView("course-detail"); window.scrollTo(0, 0); };

  const handleNew = () => { setEditingId(null); setDraftImport(null); setAdminTab("form"); };
  const handleEdit = (id) => { setEditingId(id); setDraftImport(null); setAdminTab("form"); };
  const handleDelete = (id) => {
    if (typeof window.confirm === "function" && !window.confirm("Excluir este curso definitivamente?")) return;
    persistCourses(courses.filter((c) => c.id !== id));
    showToast("Curso excluído.");
  };
  const handleToggleStatus = (id) => persistCourses(courses.map((c) => c.id === id ? { ...c, status: c.status === "published" ? "hidden" : "published" } : c));
  const handleMove = (id, dir) => {
    const sorted = [...courses].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((c) => c.id === id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    [sorted[idx].order, sorted[swapIdx].order] = [sorted[swapIdx].order, sorted[idx].order];
    persistCourses(courses.map((c) => sorted.find((s) => s.id === c.id) ? { ...c, order: sorted.find((s) => s.id === c.id).order } : c));
  };
  const handleSaveForm = (data) => {
    if (editingId) {
      persistCourses(courses.map((c) => c.id === editingId ? { ...c, ...data } : c));
      showToast("Curso atualizado.");
    } else {
      const newCourse = makeCourse({ ...data, order: courses.length });
      persistCourses([...courses, newCourse]);
      showToast("Curso adicionado.");
    }
    setDraftImport(null); setAdminTab("dashboard");
  };
  const handleImported = (draft) => { setDraftImport(draft); setEditingId(null); setAdminTab("form"); showToast("Dados importados — revise antes de publicar."); };

  const selectedCourse = courses.find((c) => c.id === selectedId);
  const editingCourse = editingId ? courses.find((c) => c.id === editingId) : (draftImport || makeCourse({ name: "" }));

  if (!loaded) {
    return <div className="dekole" style={{ display: "grid", placeItems: "center", minHeight: "100vh" }}><GlobalStyle /><div style={{ color: "var(--muted)" }}>Carregando DEKOLE…</div></div>;
  }

  if (view === "admin") {
    return (
      <div className="dekole admin-shell">
        <GlobalStyle /><div className="bgfx" />
        {!adminAuthed ? (
          <AdminLogin onLogin={() => setAdminAuthed(true)} back={goHome} adminPassword={adminPassword} />
        ) : adminTab === "form" ? (
          <AdminCourseForm course={editingCourse} onSave={handleSaveForm} onCancel={() => { setDraftImport(null); setAdminTab("dashboard"); }} />
        ) : adminTab === "settings" ? (
          <AdminSettings config={config} onSave={(c) => { persistConfig(c); showToast("Configurações salvas."); setAdminTab("dashboard"); }} onCancel={() => setAdminTab("dashboard")} adminPassword={adminPassword} onChangePassword={(p) => { persistPassword(p); showToast("Senha atualizada."); }} />
        ) : adminTab === "import" ? (
          <>
            <div className="container" style={{ paddingTop: 20 }}>
              <button className="back-link" onClick={() => setAdminTab("dashboard")}><ArrowLeft size={15} /> Voltar ao painel</button>
            </div>
            <AdminImport onImported={handleImported} config={config} claudeEnv={HAS_CLAUDE_STORAGE} />
          </>
        ) : (
          <AdminDashboard courses={courses} setView={changeView} onEdit={handleEdit} onNew={handleNew} onDelete={handleDelete} onToggleStatus={handleToggleStatus} onMove={handleMove} onLogout={() => { setAdminAuthed(false); goHome(); }} onGoTab={setAdminTab} tab={adminTab} />
        )}
        {toast && <div className="toast">{toast}</div>}
      </div>
    );
  }

  return (
    <div className="dekole">
      <GlobalStyle /><div className="bgfx" />
      <Header setView={changeView} menuOpen={menuOpen} setMenuOpen={setMenuOpen} goHome={goHome} config={configWithDigits} />
      {view === "home" && <HomePage courses={courses} setView={changeView} openCourse={openCourse} config={configWithDigits} />}
      {view === "courses" && <CoursesPage courses={courses} openCourse={openCourse} />}
      {view === "course-detail" && <CourseDetailPage course={selectedCourse} back={() => changeView("courses")} config={configWithDigits} />}
      {view === "about" && <AboutPage config={configWithDigits} />}
      {view === "contact" && <ContactPage config={configWithDigits} />}
      <Footer setView={changeView} config={configWithDigits} />
      <a className="float-wa" href={waLink(configWithDigits.whatsappDigits, `Olá! Gostaria de saber mais sobre os cursos da ${config.companyName}.`)} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><MessageCircle size={26} color="#0a0714" /></a>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
