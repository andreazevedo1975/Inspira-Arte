import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "35mb" }));
app.use(express.urlencoded({ extended: true, limit: "35mb" }));

// Curated high-resolution photographic library categorized by style and mood
const CURATED_THEMES: Record<string, string[]> = {
  default: [
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=85",
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1400&q=85",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1400&q=85",
    "https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=1400&q=85",
    "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1400&q=85",
  ],
  pb: [
    "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=1400&q=85",
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1400&q=85",
    "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=1400&q=85",
  ],
  vintage: [
    "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1400&q=85",
    "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1400&q=85",
    "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1400&q=85",
  ],
  cyberpunk: [
    "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1400&q=85",
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1400&q=85",
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1400&q=85",
  ],
  cinematic: [
    "https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=1400&q=85",
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1400&q=85",
    "https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?auto=format&fit=crop&w=1400&q=85",
  ],
  fotografia: [
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1400&q=85",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=85",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1400&q=85",
  ],
  aquarela: [
    "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1400&q=85",
    "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1400&q=85",
    "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1400&q=85",
  ],
  minimalista: [
    "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1400&q=85",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=85",
    "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1400&q=85",
  ],
  "3d": [
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1400&q=85",
    "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1400&q=85",
    "https://images.unsplash.com/photo-1633167606207-d840b5070fc2?auto=format&fit=crop&w=1400&q=85",
  ],
  superacao: [
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=85",
    "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=1400&q=85",
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1400&q=85",
  ],
  paz: [
    "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1400&q=85",
    "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1400&q=85",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=85",
  ],
  cosmic: [
    "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1400&q=85",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1400&q=85",
    "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1400&q=85",
  ],
  luxury: [
    "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1400&q=85",
    "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1400&q=85",
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1400&q=85",
  ],
};

// Generates procedural high-resolution vector artwork in base64 as guaranteed offline fallback
function generateProceduralSvgBase64(category: string, themeTitle: string = ""): string {
  let g1 = "#8B5CF6";
  let g2 = "#EC4899";
  let g3 = "#0B0F19";
  let sunColor = "#F59E0B";

  if (category === "pb") {
    g1 = "#F8FAFC";
    g2 = "#64748B";
    g3 = "#020617";
    sunColor = "#E2E8F0";
  } else if (category === "cyberpunk") {
    g1 = "#06B6D4";
    g2 = "#D946EF";
    g3 = "#030712";
    sunColor = "#F43F5E";
  } else if (category === "vintage") {
    g1 = "#F59E0B";
    g2 = "#B45309";
    g3 = "#1C1917";
    sunColor = "#FEF08A";
  } else if (category === "cinematic") {
    g1 = "#38BDF8";
    g2 = "#F97316";
    g3 = "#030712";
    sunColor = "#FDBA74";
  } else if (category === "aquarela") {
    g1 = "#EC4899";
    g2 = "#8B5CF6";
    g3 = "#1E1B4B";
    sunColor = "#F472B6";
  } else if (category === "minimalista") {
    g1 = "#CBD5E1";
    g2 = "#64748B";
    g3 = "#0F172A";
    sunColor = "#94A3B8";
  } else if (category === "3d" || category === "cosmic") {
    g1 = "#A855F7";
    g2 = "#06B6D4";
    g3 = "#09090B";
    sunColor = "#38BDF8";
  } else if (category === "paz") {
    g1 = "#10B981";
    g2 = "#065F46";
    g3 = "#022C22";
    sunColor = "#34D399";
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
    <defs>
      <radialGradient id="sky-grad" cx="50%" cy="35%" r="75%">
        <stop offset="0%" stop-color="${g1}" stop-opacity="0.95" />
        <stop offset="45%" stop-color="${g2}" stop-opacity="0.75" />
        <stop offset="100%" stop-color="${g3}" />
      </radialGradient>
      <linearGradient id="glow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${sunColor}" stop-opacity="0.8" />
        <stop offset="100%" stop-color="${g1}" stop-opacity="0.2" />
      </linearGradient>
      <filter id="soft-glow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="35" result="blur" />
      </filter>
    </defs>
    <rect width="100%" height="100%" fill="url(#sky-grad)" />
    <!-- Ambient Celestial Orbs -->
    <circle cx="512" cy="380" r="180" fill="${sunColor}" opacity="0.25" filter="url(#soft-glow)" />
    <circle cx="512" cy="380" r="100" fill="url(#glow-grad)" opacity="0.9" />
    <circle cx="512" cy="380" r="70" fill="#FFFFFF" opacity="0.85" />
    
    <!-- Geometric Sacred Halo Rings -->
    <circle cx="512" cy="380" r="140" stroke="${g1}" stroke-width="2" stroke-dasharray="8 6" opacity="0.5" fill="none" />
    <circle cx="512" cy="380" r="220" stroke="${g2}" stroke-width="1.5" stroke-dasharray="4 8" opacity="0.3" fill="none" />

    <!-- Distant Horizons and Atmospheric Mountain Layers -->
    <path d="M0 680 L200 520 L440 640 L700 460 L1024 620 L1024 1024 L0 1024 Z" fill="${g2}" opacity="0.35" />
    <path d="M0 750 L260 590 L512 700 L760 540 L1024 690 L1024 1024 L0 1024 Z" fill="${g3}" opacity="0.8" />
    <path d="M0 830 L320 670 L620 790 L880 640 L1024 760 L1024 1024 L0 1024 Z" fill="${g3}" opacity="0.98" />
    
    <!-- Horizon Line Glow & Foundation -->
    <line x1="0" y1="840" x2="1024" y2="840" stroke="${sunColor}" stroke-width="1.5" opacity="0.4" />
    <rect y="920" width="1024" height="104" fill="${g3}" />
  </svg>`;

  const buffer = Buffer.from(svg, "utf-8");
  return `data:image/svg+xml;base64,${buffer.toString("base64")}`;
}

// Convert image URL to base64 for reliable canvas export
async function fetchImageAsBase64(url: string, category: string = "default"): Promise<string> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const mimeType = res.headers.get("content-type") || "image/jpeg";
      return `data:${mimeType};base64,${buffer.toString("base64")}`;
    }
  } catch (err) {
    console.warn("fetchImageAsBase64 notice (using procedural vector art):", err);
  }
  return generateProceduralSvgBase64(category);
}

// Free keyless AI image generator (Pollinations AI) with fast timeout
async function generateImageWithPollinations(
  prompt: string,
  aspectRatio: string = "1:1"
): Promise<string | null> {
  let width = 1024;
  let height = 1024;
  if (aspectRatio === "16:9") {
    width = 1280;
    height = 720;
  } else if (aspectRatio === "9:16") {
    width = 720;
    height = 1280;
  } else if (aspectRatio === "4:3") {
    width = 1024;
    height = 768;
  } else if (aspectRatio === "3:4") {
    width = 768;
    height = 1024;
  }

  const seed = Math.floor(Math.random() * 900000) + 10000;
  // Clean prompt and enforce high aesthetics with expanded fidelity window for rich mascot details
  const cleanPrompt = prompt.replace(/[^\w\s,.-]/gi, " ").trim().slice(0, 750);
  const aestheticPrompt = `${cleanPrompt}, masterpiece, high quality, artistic illumination, beautiful composition`;
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(aestheticPrompt)}?width=${width}&height=${height}&nologo=true&seed=${seed}`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(6500) });
    if (res.ok) {
      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      if (buffer.length > 5000) {
        return `data:image/jpeg;base64,${buffer.toString("base64")}`;
      }
    }
  } catch (err) {
    console.warn("Pollinations keyless AI generation attempt timed out or failed:", err);
  }
  return null;
}

let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Resilient caller with a strict 2.5-second timeout so it never blocks the user
async function generateContentFast(
  ai: GoogleGenAI,
  model: string,
  contents: any,
  config?: any,
  timeoutMs: number = 2500
): Promise<any | null> {
  try {
    const timeoutPromise = new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error("AI generation timeout")), timeoutMs)
    );
    const apiPromise = ai.models.generateContent({
      model,
      contents,
      config,
    });
    return await Promise.race([apiPromise, timeoutPromise]);
  } catch (err: any) {
    console.warn(`[AI Fast Caller Notice] ${model} unavailable or exceeded ${timeoutMs}ms, using local engine:`, err?.message || err);
    return null;
  }
}

// Master collection of 90+ authentic Portuguese quotes categorized across all 9 feeling tones
const MASTER_CURATED_QUOTES: Record<string, string[]> = {
  raiva: [
    "Minha paciência não acabou: ela foi promovida a tolerância zero com a mediocridade.",
    "O fogo da minha revolta é o mesmo que queima as pontes que me prendiam ao passado.",
    "Não confunda meu silêncio com fraqueza: estou apenas calculando o impacto do meu basta.",
    "A tempestade que tentou me afogar virou a correnteza que me empurrou para a vitória.",
    "Cansado de pedir licença para quem só sabe construir muros no caminho dos outros.",
    "Transforme a fúria que queima no peito em combustível para construir algo inabalável.",
    "Não me peça calma quando a hipocrisia é o ar que os outros respiram sem vergonha.",
    "O limite chegou, o aviso acabou: agora é atitude, postura e resposta firme.",
    "A indignação é o primeiro passo de quem se recusa a aceitar o inaceitável.",
    "Minha resposta para quem duvidou não serão palavras, será o estrondo da minha conquista.",
  ],
  satira: [
    "Trabalhe duro hoje para que amanhã você possa reclamar do cansaço em Paris.",
    "Sua opinião é de extrema relevância, mas felizmente não tem nenhum peso nas minhas escolhas.",
    "Mais um dia fingindo maturidade corporativa enquanto o caos faz malabarismo com meus neurônios.",
    "Adoro quando me dizem como viver a vida, especialmente quem nem consegue organizar a própria gaveta.",
    "O bom do fundo do poço é que pelo menos ninguém te pede para pagar o frete.",
    "Simplicidade é a chave: se não agrega, não soma e não faz rir, favor não insistir.",
    "A paciência foi enviada por correio normal e provavelmente foi extraviada em Curitiba.",
    "Sorria sempre: isso confunde quem queria ver você surtando no horário comercial.",
    "Sigo firme nos meus propósitos, especialmente no de não perder a sanidade antes do almoço.",
    "Vida adulta é 10% tomar decisões e 90% tentar entender para onde foi o salário.",
  ],
  comico: [
    "Eu até tento ser uma pessoa fitness e centrada, mas a coxinha tem um poder de persuasão desleal.",
    "Movido exclusivamente a café amargo, desespero pontual e esperança de dormir 8 horas seguidas.",
    "Minha meta de hoje era ser extremamente produtivo; a de amanhã será perdoar o fracasso de hoje.",
    "Se a vida fechar uma porta, pule a janela com elegância e grite que foi coreografia.",
    "Procrastinar com classe é uma arte milenar que venho aperfeiçoando com dedicação diária.",
    "Tudo passa, menos a minha vontade inexplicável de comprar coisas que não preciso às 2 da manhã.",
    "Acordei com uma disposição invejável de voltar a dormir por mais 48 horas seguidas.",
    "Rir dos próprios tombos é economizar em terapia e ainda divertir os amigos leais.",
    "Resiliência é conseguir achar graça da bagunça enquanto tenta achar a chave de casa.",
    "O universo me fez forte porque sabia que se me fizesse rico eu não saberia lidar com tanto gasto.",
  ],
  direto: [
    "Ninguém está vindo te resgatar. Levante da cadeira, encare a realidade e execute.",
    "Menos desculpas, zero drama e mais resultados. O restante é pura perda de tempo.",
    "O tempo não espera seu medo passar. Comece exatamente de onde você está e com o que tem.",
    "Quem quer dá um jeito; quem não quer inventa uma história bem elaborada.",
    "Foco é saber dizer 'não' para mil distrações atraentes para dizer 'sim' ao seu objetivo.",
    "Você não precisa de mais motivação; você precisa de vergonha na cara e consistência.",
    "O preço da disciplina é medido em gramas; o do arrependimento é medido em toneladas.",
    "Pare de negociar com a preguiça: o sucesso não faz concessões nem aceita atalhos.",
    "Seja a pessoa que faz as coisas acontecerem, não a que fica assistindo os outros vencerem.",
    "A realidade não se importa com seus sentimentos sobre o trabalho que precisa ser feito.",
  ],
  amoroso: [
    "No meio do turbilhão do mundo, o teu abraço sempre será o meu porto de paz e silêncio.",
    "Amar é descobrir todos os dias que a felicidade mora nos detalhes mais simples e sinceros.",
    "Você é o poema mais bonito que a vida escolheu escrever nas entrelinhas da minha história.",
    "O amor não se mede pela ausência de tempestades, mas pela certeza de estarmos no mesmo barco.",
    "O afeto verdadeiro não aprisiona: ele dá asas para voar e raízes para querer voltar.",
    "Cuidar de quem amamos é a forma mais pura de gratidão que a alma pode manifestar.",
    "A doçura de um olhar compreensivo cura dores que nenhuma palavra conseguiria explicar.",
    "Que o amor seja a nossa primeira escolha e o nosso mais tranquilo refúgio.",
    "Amar a si mesmo é o alicerce sagrado sobre o qual todos os outros amores florescem.",
    "Nosso amor é feito de risos compartilhados, silêncios acolhedores e cumplicidade sem fim.",
  ],
  melancolico: [
    "Há ausências que pesam mais na alma do que qualquer palavra não dita.",
    "A saudade é a prova viva de que aquilo que passou teve a grandeza de ser inesquecível.",
    "Na quietude da chuva fina, as memórias antigas encontram espaço para respirar.",
    "Cicatrizes não são marcas de dor, são poemas gravados sobre as batalhas que vencemos.",
    "Existe uma beleza silenciosa e poética nas despedidas que abriram caminhos necessários.",
    "O tempo leva os momentos, mas lapida na alma as lembranças dos abraços mais quentes.",
    "Sentir saudade é manter acesa a fogueira de um tempo que fez nosso coração queimar de vida.",
    "No silêncio da noite, os ecos do passado sussurram verdades que a pressa do dia calou.",
    "A tristeza passa, mas a profundidade que ela esculpe em nós permanece para sempre.",
    "O outono ensina que perder certas folhas é a única forma de sobreviver ao inverno.",
  ],
  empoderado: [
    "Eu não cheguei até aqui para pedir espaço. Eu vim para ocupar o lugar que edifiquei.",
    "Minha força nunca dependeu da aprovação de quem duvidou dos meus primeiros passos.",
    "Construí minhas asas no salto da coragem: o céu agora é o meu território natural.",
    "Dona absoluta da minha narrativa, ciente do meu valor e inabalável perante o vento.",
    "O brilho de quem se reconstruiu do pó tem a potência de ofuscar qualquer escuridão.",
    "Não tente definir meus limites com base nas suas próprias inseguranças.",
    "Mulher soberana do seu destino: firme na postura, nobre no olhar e leoa na execução.",
    "Conquistas não são sorte: são o fruto visível de madrugadas silenciosas de trabalho duro.",
    "Quando uma pessoa descobre a sua força interior, nada no mundo consegue deter sua marcha.",
    "Minha trajetória é esculpida em ouro e ferro: nenhuma derrota teve o poder de me quebrar.",
  ],
  filosofico: [
    "Não podemos controlar o sopro dos ventos, mas temos o domínio absoluto do leme.",
    "A verdadeira liberdade começa no instante em que você para de mendigar a validação alheia.",
    "A serenidade da mente não é a ausência de caos, mas a paz inabalável no olho do furacão.",
    "Amor Fati: não apenas suporte o seu destino, apaixone-se por cada curva do caminho.",
    "O homem que governa a si mesmo é mais poderoso do que o imperador que conquista nações.",
    "Tudo o que acontece é matéria-prima para a virtude de quem sabe contemplar a vida.",
    "A sabedoria consiste em distinguir o que depende de nós daquilo que escapa ao nosso alcance.",
    "Pouco precisa quem aprendeu a apreciar a vastidão das coisas mais simples e essenciais.",
    "O silêncio interior é o templo onde as maiores decisões são tomadas com lucidez.",
    "A morte não deve ser temida por quem aprendeu a honrar e viver com integridade cada dia.",
  ],
  inspirador: [
    "Acredite no poder dos seus recomeços: cada alvorecer entrega uma nova oportunidade divina.",
    "A sua luz não diminui ao iluminar o caminho de quem tropeça ao seu lado.",
    "Das cinzas da maior tempestade florescem as sementes da sua mais gloriosa primavera.",
    "Grandes histórias não são escritas em dias calmos, mas em noites de superação inabalável.",
    "Mantenha os olhos fixos nas estrelas e os pés firmes na terra: o impossível é temporário.",
    "Você sobreviveu a cem por cento dos seus piores dias: continue avançando com dignidade.",
    "A fé na sua jornada é a chama que nenhuma tempestade deste mundo consegue apagar.",
    "Transforme a sua dor em força propulsora e faça da sua vida uma obra-prima de coragem.",
    "Dentro de você existe um gigante adormecido pronto para despertar e moldar a realidade.",
    "O sucesso pertence àqueles que mantiveram a fé mesmo quando todas as luzes se apagaram.",
  ],
};

function resolveFeelingKey(tone: string = ""): string {
  const lowerTone = String(tone).toLowerCase();
  if (lowerTone.includes("raiva") || lowerTone.includes("revolta") || lowerTone.includes("furia")) return "raiva";
  if (lowerTone.includes("satir") || lowerTone.includes("ironi") || lowerTone.includes("sarcas")) return "satira";
  if (lowerTone.includes("comic") || lowerTone.includes("engraçad") || lowerTone.includes("humor") || lowerTone.includes("divertid")) return "comico";
  if (lowerTone.includes("direto") || lowerTone.includes("cru") || lowerTone.includes("sem rodeios") || lowerTone.includes("verdade")) return "direto";
  if (lowerTone.includes("amor") || lowerTone.includes("romant") || lowerTone.includes("afet") || lowerTone.includes("carinho")) return "amoroso";
  if (lowerTone.includes("melancol") || lowerTone.includes("saudad") || lowerTone.includes("nostalg")) return "melancolico";
  if (lowerTone.includes("empoder") || lowerTone.includes("poder") || lowerTone.includes("conquista")) return "empoderado";
  if (lowerTone.includes("filosof") || lowerTone.includes("estoi") || lowerTone.includes("sabed")) return "filosofico";
  return "inspirador";
}

// 0. Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    mode: "self-contained-autonomous",
    hasKey: Boolean(process.env.GEMINI_API_KEY || process.env.API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// 1. Generate Prompt from Theme (Keyless & Instant)
app.post("/api/generate-prompt", async (req, res) => {
  try {
    const { theme, style, mood } = req.body;
    if (!theme || typeof theme !== "string") {
      return res.status(400).json({ error: "O tema é obrigatório." });
    }

    // Try fast Gemini model first if available
    const ai = getAI();
    if (ai) {
      const systemInstruction = `You are a master digital artist. Transform the user theme into a breathtaking visual prompt in ENGLISH for AI image generators. Output ONLY the visual prompt text without explanations or quotes.`;
      const aiResponse = await generateContentFast(
        ai,
        "gemini-3.8-flash",
        `Theme: ${theme}. Style: ${style || "Cinematic"}. Mood: ${mood || "Inspiring"}.`,
        { systemInstruction, temperature: 0.75 },
        2000
      );
      if (aiResponse && aiResponse.text) {
        return res.json({ prompt: aiResponse.text.trim() });
      }
    }

    // High quality algorithmic prompt generator
    const styleModifiers: Record<string, string> = {
      Cinemático: "cinematic wide angle shot, 35mm anamorphic lens, dramatic volumetric lighting, depth of field, hyperrealistic",
      "3D Render": "isometric 3D render, octane render, soft ambient occlusion, smooth surfaces, vivid subsurface scattering",
      Cyberpunk: "cyberpunk aesthetic, vibrant neon hues, cyan and magenta lighting, futuristic dark city reflections",
      "P&B Minimalista": "fine art black and white photography, high contrast chiaroscuro, pure minimalist composition, silver gelatin look",
      Aquarela: "delicate watercolor on textured paper, soft fluid pigment washes, wet-on-wet technique, elegant color bleeding",
      "Fotografia Analógica": "vintage Kodachrome 35mm film stock, warm golden tones, natural grain, authentic nostalgic feel",
      "Vintage Retrô": "retro 1970s aesthetic, muted warm pastel colors, subtle chromatic aberration, timeless atmosphere",
      "Arte Conceitual": "epic sci-fi concept art, expansive scale, dramatic atmospheric perspective, matte painting masterpiece",
      "Pintura a Óleo": "classic oil painting on canvas, expressive impasto brushstrokes, rich velvety shadows, Rembrandt lighting",
      "Neon Glow": "luminous glowing light trails, electric vibrancy, dark obsidian background, radiant specular highlights",
    };

    const chosenModifier = styleModifiers[style || "Cinemático"] || "volumetric lighting, artistic composition, masterpiece 8k";
    const promptText = `A breathtaking visual masterpiece representing "${theme}", ${chosenModifier}, inspiring and deeply evocative mood, 8k resolution, award-winning visual composition`;

    res.json({ prompt: promptText });
  } catch (error: any) {
    console.error("Error in /api/generate-prompt:", error?.message || error);
    res.json({
      prompt: `A breathtaking artistic scene depicting ${req.body?.theme || "inspiration"}, cinematic lighting, volumetric atmosphere, masterpiece 8k`,
    });
  }
});

// 2. Generate Quote from Image or Theme (Keyless & Master Curated)
app.post("/api/generate-quote", async (req, res) => {
  try {
    const { base64Image, mimeType, theme, tone = "Inspirador" } = req.body;
    const feelingKey = resolveFeelingKey(tone);
    const pool = MASTER_CURATED_QUOTES[feelingKey] || MASTER_CURATED_QUOTES.inspirador;

    // Try fast Gemini model if available
    const ai = getAI();
    if (ai) {
      const systemInstruction = `Você é um autor renomado e mestre de aforismos contemporâneos.
Crie UMA ÚNICA FRASE EM PORTUGUÊS (BR) com alta ressonância emocional.
Sentimento obrigatório: ${tone}.
Requisitos:
- Entre 8 e 24 palavras.
- NUNCA use aspas, nem nome de autor, nem explicações. Retorne apenas o texto puro da frase.`;

      let contents: any = `Escreva uma frase marcante com o sentimento de "${tone}" sobre o tema "${theme || "vida e atitude"}".`;
      if (base64Image) {
        const cleanBase64 = base64Image.replace(/^data:[^;]+;base64,/, "");
        contents = {
          parts: [
            { inlineData: { data: cleanBase64, mimeType: mimeType || "image/jpeg" } },
            { text: `Escreva uma frase marcante com tom de "${tone}". Contexto: ${theme || "existência"}.` },
          ],
        };
      }

      const aiResponse = await generateContentFast(
        ai,
        "gemini-3.8-flash",
        contents,
        { systemInstruction, temperature: 0.8 },
        2500
      );

      if (aiResponse && aiResponse.text) {
        const cleanQuote = aiResponse.text.replace(/^["'«»]|["'«»]$/g, "").trim();
        if (cleanQuote.length > 10) {
          return res.json({ quote: cleanQuote });
        }
      }
    }

    // Select random quote from curated master pool
    const selectedQuote = pool[Math.floor(Math.random() * pool.length)];
    res.json({ quote: selectedQuote });
  } catch (error: any) {
    console.error("Error in /api/generate-quote:", error?.message || error);
    const pool = MASTER_CURATED_QUOTES.inspirador;
    res.json({
      quote: pool[Math.floor(Math.random() * pool.length)],
    });
  }
});

// 2.5. Generate In-Character Dialogue or Speech (Character Studio)
app.post("/api/generate-character-dialogue", async (req, res) => {
  try {
    const { characterName = "Personagem", archetype = "", mood = "Determinado", expression = "", scenario = "" } = req.body;

    const ai = getAI();
    if (ai) {
      const prompt = `Você é o roteirista do personagem "${characterName}" (${archetype}).
O personagem está no seguinte cenário: "${scenario}".
Sentimento/humor vivido: "${mood}".
Feição facial: "${expression}".
Escreva UMA única fala curta e marcante (máximo 110 caracteres) em português brasileiro dita ou pensada pelo personagem nesta cena.
Retorne apenas a frase direta em primeira pessoa, sem aspas nem explicações.`;

      const aiResponse = await generateContentFast(ai, "gemini-2.5-flash", prompt, undefined, 2500);
      if (aiResponse && aiResponse.text) {
        const clean = aiResponse.text.replace(/^["'«»]|["'«»]$/g, "").trim();
        if (clean.length > 5) {
          return res.json({ dialogue: clean });
        }
      }
    }

    // Contextual fallback based on mood
    const key = resolveFeelingKey(mood);
    const pool = MASTER_CURATED_QUOTES[key] || MASTER_CURATED_QUOTES.inspirador;
    const fallbackLine = pool[Math.floor(Math.random() * pool.length)];
    res.json({ dialogue: fallbackLine });
  } catch {
    res.json({ dialogue: "Minha história está apenas começando, e o próximo passo é meu." });
  }
});

// 2.7. Deep Mascot Identity & DNA Visual Analyzer (Vision-Powered Fidelity Anchor)
app.post("/api/analyze-mascot", async (req, res) => {
  try {
    const { base64Image, mimeType = "image/png", mascotName = "", notes = "" } = req.body;

    if (!base64Image) {
      return res.status(400).json({ error: "Imagem do mascote é obrigatória." });
    }

    const cleanBase64 = base64Image.replace(/^data:[^;]+;base64,/, "");

    const ai = getAI();
    if (ai) {
      try {
        const systemInstruction = `You are a world-class Mascot Designer, Art Director and Character Fidelity Engineer.
Analyze the provided mascot/character image with microscopic precision.
Extract its Visual DNA so an AI image generator can reproduce THIS EXACT MASCOT with 100% visual consistency across various emotions, moods, outfits, and environments.

Instructions:
1. Identify the exact species/form (e.g. "Stylized 3D Fox", "Cute chubby white and cyan robot", "Anthropomorphic owl", etc.).
2. Extract the exact color palette (names and hex tones of fur, skin, clothing, accessories).
3. Describe exact facial traits (eye color and shape, muzzle, ears, brows, smile).
4. Identify original art style (e.g. "Animação 3D Estilizada (estilo Pixar)", "Ilustração Vetorial 2D", "Cinemático 3D (8K)", "Anime & Manga Premium").
5. Note all signature permanent accessories or clothing in the image.
6. Write a comprehensive 'consistencyAnchorPrompt' in English that locks down these visual traits so that prompt generators can maintain identical character recognition.

Return strictly JSON matching the required schema.`;

        const prompt = `Analyze this imported mascot image. Name hint: "${mascotName || "Mascote"}". User context notes: "${notes || "Mascote da marca para usar em diversos cenários e sentimentos"}".`;

        const contents = {
          parts: [
            { inlineData: { data: cleanBase64, mimeType: mimeType || "image/png" } },
            { text: prompt },
          ],
        };

        const aiResponse = await generateContentFast(
          ai,
          "gemini-2.5-flash",
          contents,
          {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                speciesOrType: { type: Type.STRING },
                archetype: { type: Type.STRING },
                artStyle: { type: Type.STRING },
                colorPalette: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                facialFeatures: { type: Type.STRING },
                signatureDetails: { type: Type.STRING },
                defaultClothing: { type: Type.STRING },
                consistencyAnchorPrompt: { type: Type.STRING },
                suggestedBio: { type: Type.STRING },
              },
              required: [
                "name",
                "speciesOrType",
                "artStyle",
                "colorPalette",
                "facialFeatures",
                "signatureDetails",
                "consistencyAnchorPrompt",
              ],
            },
          },
          3500
        );

        if (aiResponse && aiResponse.text) {
          const parsed = JSON.parse(aiResponse.text);
          return res.json({
            success: true,
            dna: parsed,
          });
        }
      } catch (err: any) {
        console.warn("Gemini vision mascot analysis fallback:", err?.message || err);
      }
    }

    // High quality intelligent heuristic fallback
    const resolvedName = mascotName?.trim() || "Mascote Guardião";
    const fallbackDna = {
      name: resolvedName,
      speciesOrType: "Mascote carismático estilizado",
      archetype: "Embaixador e Mascote Oficial",
      artStyle: "Animação 3D Estilizada",
      colorPalette: ["#7C3AED Roxo Vibrante", "#38BDF8 Ciano Iluminado", "#FFFFFF Branco Puro", "#F59E0B Dourado"],
      facialFeatures: "Olhos grandes e expressivos, olhar amigável e acolhedor, feições arredondadas e carismáticas",
      signatureDetails: "Silhueta icônica reconhecível, proporções equilibradas e aura marcante da marca",
      defaultClothing: "Acessórios característicos da imagem original importada",
      consistencyAnchorPrompt: `Iconic charismatic character mascot, exact same appearance as reference image, distinct recognizable facial features, large expressive eyes, friendly proportions, clean studio lighting, high detail, identical color scheme and design`,
      suggestedBio: `Mascote oficial criado a partir da imagem importada de referência, mantendo fidelidade absoluta a seus traços visuais em todas as emoções e histórias.`,
    };

    res.json({
      success: true,
      dna: fallbackDna,
    });
  } catch (error: any) {
    console.error("Error in /api/analyze-mascot:", error);
    res.status(500).json({ error: "Falha ao analisar imagem do mascote." });
  }
});

// 3. Generate Image (100% Keyless, Pollinations AI + Curated Thematic Library + Procedural Vector Art)
app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt, aspectRatio = "1:1", themeHint = "" } = req.body;
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt é obrigatório." });
    }

    // Categorize style and prompt keywords
    const lowerPrompt = (prompt + " " + themeHint).toLowerCase();
    let selectedCategory = "default";
    if (lowerPrompt.includes("preto e branco") || lowerPrompt.includes("p&b") || lowerPrompt.includes("monochrome")) {
      selectedCategory = "pb";
    } else if (lowerPrompt.includes("cyberpunk") || lowerPrompt.includes("neon") || lowerPrompt.includes("synthwave")) {
      selectedCategory = "cyberpunk";
    } else if (lowerPrompt.includes("vintage") || lowerPrompt.includes("retro") || lowerPrompt.includes("analógic")) {
      selectedCategory = "vintage";
    } else if (lowerPrompt.includes("cinemático") || lowerPrompt.includes("cinematic") || lowerPrompt.includes("35mm")) {
      selectedCategory = "cinematic";
    } else if (lowerPrompt.includes("aquarela") || lowerPrompt.includes("watercolor") || lowerPrompt.includes("pintura")) {
      selectedCategory = "aquarela";
    } else if (lowerPrompt.includes("minimalista") || lowerPrompt.includes("minimalist") || lowerPrompt.includes("zen")) {
      selectedCategory = "minimalista";
    } else if (lowerPrompt.includes("3d") || lowerPrompt.includes("octane") || lowerPrompt.includes("render")) {
      selectedCategory = "3d";
    } else if (lowerPrompt.includes("supera") || lowerPrompt.includes("coragem") || lowerPrompt.includes("vencer")) {
      selectedCategory = "superacao";
    } else if (lowerPrompt.includes("paz") || lowerPrompt.includes("calma") || lowerPrompt.includes("silêncio")) {
      selectedCategory = "paz";
    } else if (lowerPrompt.includes("galaxia") || lowerPrompt.includes("cosm") || lowerPrompt.includes("espaco") || lowerPrompt.includes("estrel")) {
      selectedCategory = "cosmic";
    } else if (lowerPrompt.includes("luxo") || lowerPrompt.includes("ouro") || lowerPrompt.includes("diamante")) {
      selectedCategory = "luxury";
    }

    // Step 1: Attempt Free AI Image Generation via Pollinations AI
    const aiImageBase64 = await generateImageWithPollinations(prompt, aspectRatio);
    if (aiImageBase64) {
      const pureBase64 = aiImageBase64.replace(/^data:[^;]+;base64,/, "");
      return res.json({
        imageUrl: aiImageBase64,
        imageBase64: pureBase64,
        source: "ai",
      });
    }

    // Step 2: High-resolution curated photographic theme
    const themeList = CURATED_THEMES[selectedCategory] || CURATED_THEMES.default;
    const selectedUrl = themeList[Math.floor(Math.random() * themeList.length)];
    const base64Image = await fetchImageAsBase64(selectedUrl, selectedCategory);
    const pureBase64 = base64Image.replace(/^data:[^;]+;base64,/, "");

    return res.json({
      imageUrl: base64Image,
      imageBase64: pureBase64,
      source: "curated",
    });
  } catch (error: any) {
    console.error("Error in /api/generate-image:", error?.message || error);
    const fallbackSvg = generateProceduralSvgBase64("default");
    const pureBase64 = fallbackSvg.replace(/^data:[^;]+;base64,/, "");
    res.json({
      imageUrl: fallbackSvg,
      imageBase64: pureBase64,
      source: "procedural",
    });
  }
});

// 4. Generate Variations (Keyless, Multi-angle Variations)
app.post("/api/generate-variations", async (req, res) => {
  try {
    const { prompt, aspectRatio = "1:1" } = req.body;
    const variations: string[] = [];

    const lowerPrompt = (prompt || "").toLowerCase();
    let selectedCategory = "default";
    if (lowerPrompt.includes("preto e branco") || lowerPrompt.includes("p&b")) selectedCategory = "pb";
    else if (lowerPrompt.includes("cyberpunk") || lowerPrompt.includes("neon")) selectedCategory = "cyberpunk";
    else if (lowerPrompt.includes("vintage") || lowerPrompt.includes("retro")) selectedCategory = "vintage";
    else if (lowerPrompt.includes("cinematic") || lowerPrompt.includes("cinemático")) selectedCategory = "cinematic";

    // Attempt 1 Pollinations variation with dynamic angle
    const altPrompt = `${prompt || "cinematic scene"}, alternative dynamic camera angle, ethereal lighting`;
    const aiVar = await generateImageWithPollinations(altPrompt, aspectRatio);
    if (aiVar) {
      variations.push(aiVar);
    }

    // Fill remaining with curated aesthetic library
    const themeList = CURATED_THEMES[selectedCategory] || CURATED_THEMES.default;
    for (const url of themeList) {
      if (variations.length >= 3) break;
      const b64 = await fetchImageAsBase64(url, selectedCategory);
      variations.push(b64);
    }

    // Guarantee 3 variations
    while (variations.length < 3) {
      variations.push(generateProceduralSvgBase64(selectedCategory));
    }

    res.json({ variations });
  } catch (error: any) {
    console.error("Error in /api/generate-variations:", error);
    const defaultList = CURATED_THEMES.default;
    const fallbackVariations: string[] = [];
    for (const url of defaultList.slice(0, 3)) {
      const b64 = await fetchImageAsBase64(url, "default");
      fallbackVariations.push(b64);
    }
    res.json({ variations: fallbackVariations });
  }
});

// 5. Generate Visual Identity & Mascot (Autonomous Senior Branding Engine)
app.post("/api/generate-identity", async (req, res) => {
  try {
    const { base64Image, mimeType, description = "" } = req.body;

    const lowerDesc = String(description).toLowerCase();

    // Industry keyword extraction
    let defaultBrand = "Aura Criativa";
    let defaultSlogan = "Inovação que inspira e transforma.";
    let defaultStory = "Uma marca contemporânea criada para conectar propósitos e despertar o melhor potencial de sua comunidade.";
    let defaultColors = {
      primary: "#7C3AED",
      secondary: "#EC4899",
      accent: "#F59E0B",
      background: "#0F172A",
    };
    let mascotPrompt = "A charismatic friendly cyber owl mascot, high quality 3D character, clean lighting";

    if (lowerDesc.includes("café") || lowerDesc.includes("comida") || lowerDesc.includes("gastronom")) {
      defaultBrand = "Grão Soberano";
      defaultSlogan = "O sabor autêntico de momentos inesquecíveis.";
      defaultStory = "Nascida da paixão pela terra e pelos grãos nobres, celebramos rituais de acolhimento e aconchego em cada xícara.";
      defaultColors = { primary: "#D97706", secondary: "#78350F", accent: "#FEF3C7", background: "#1C1917" };
      mascotPrompt = "A cute friendly barista fox wearing a tiny apron, warm cozy lighting, 3D Pixar style render";
    } else if (lowerDesc.includes("yoga") || lowerDesc.includes("bem-estar") || lowerDesc.includes("saúde") || lowerDesc.includes("zen")) {
      defaultBrand = "Serenità";
      defaultSlogan = "O equilíbrio perfeito entre corpo, mente e alma.";
      defaultStory = "Criamos refúgios de silêncio e reconexão interior, inspirando hábitos conscientes para uma vida plena e em paz.";
      defaultColors = { primary: "#10B981", secondary: "#065F46", accent: "#A7F3D0", background: "#022C22" };
      mascotPrompt = "A peaceful zen lotus spirit creature, glowing gently with calm pastel mint aura, clean 3D character";
    } else if (lowerDesc.includes("tech") || lowerDesc.includes("tecnologia") || lowerDesc.includes("ia") || lowerDesc.includes("startup")) {
      defaultBrand = "Synapse Logic";
      defaultSlogan = "Inteligência que molda o amanhã.";
      defaultStory = "Pioneiros na fronteira entre dados e criatividade humana, desenvolvemos soluções exponenciais para o futuro digital.";
      defaultColors = { primary: "#06B6D4", secondary: "#3B82F6", accent: "#F43F5E", background: "#030712" };
      mascotPrompt = "A sleek robotic companion bot with glowing friendly expressive eyes, futuristic cyber look, 3D character";
    } else if (lowerDesc.includes("moda") || lowerDesc.includes("estilo") || lowerDesc.includes("roupa")) {
      defaultBrand = "Vogue & Essência";
      defaultSlogan = "Elegância consciente em cada traço.";
      defaultStory = "Design atemporal e alfaiataria responsável que veste com nobreza e autenticidade as pessoas de atitude.";
      defaultColors = { primary: "#E11D48", secondary: "#881337", accent: "#FFE4E6", background: "#0F172A" };
      mascotPrompt = "A stylish miniature cheetah wearing elegant round designer glasses, high fashion 3D mascot";
    }

    let identityData = {
      brandName: defaultBrand,
      slogan: defaultSlogan,
      story: defaultStory,
      colorPalette: defaultColors,
      mascotPrompt,
    };

    // Try fast Gemini model if available
    const ai = getAI();
    if (ai) {
      const systemInstruction = `You are a world-class branding director. Formulate a high-impact cohesive brand identity in Portuguese (BR). Return strictly JSON.`;
      const aiResponse = await generateContentFast(
        ai,
        "gemini-3.8-flash",
        `Project Description: ${description}`,
        {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              brandName: { type: Type.STRING },
              slogan: { type: Type.STRING },
              story: { type: Type.STRING },
              colorPalette: {
                type: Type.OBJECT,
                properties: {
                  primary: { type: Type.STRING },
                  secondary: { type: Type.STRING },
                  accent: { type: Type.STRING },
                  background: { type: Type.STRING },
                },
                required: ["primary", "secondary", "accent"],
              },
              mascotPrompt: { type: Type.STRING },
            },
            required: ["brandName", "slogan", "colorPalette", "mascotPrompt"],
          },
        },
        2500
      );

      if (aiResponse && aiResponse.text) {
        try {
          const parsed = JSON.parse(aiResponse.text);
          identityData = { ...identityData, ...parsed };
        } catch {
          // ignore json parse error
        }
      }
    }

    // Generate mascot image (via Pollinations AI or curated library)
    let mascotImageUrl = "";
    if (identityData.mascotPrompt) {
      const generatedMascot = await generateImageWithPollinations(identityData.mascotPrompt, "1:1");
      if (generatedMascot) {
        mascotImageUrl = generatedMascot;
      }
    }

    if (!mascotImageUrl) {
      const fallbackMascot = "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80";
      mascotImageUrl = await fetchImageAsBase64(fallbackMascot);
    }

    res.json({
      ...identityData,
      mascotImageUrl,
    });
  } catch (error: any) {
    console.error("Error in /api/generate-identity:", error);
    const fallbackMascot = "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80";
    const mascotImageUrl = await fetchImageAsBase64(fallbackMascot);
    res.json({
      brandName: "Aura Criativa",
      slogan: "Inovação que inspira e transforma.",
      story: "Uma marca contemporânea criada para conectar propósitos e despertar o melhor potencial de sua comunidade.",
      colorPalette: {
        primary: "#7C3AED",
        secondary: "#EC4899",
        accent: "#F59E0B",
        background: "#0F172A",
      },
      mascotPrompt: "A friendly mascot, colorful and inspiring",
      mascotImageUrl,
    });
  }
});

// 6. Generate Logo Strategy (Senior Art Director Engine - Keyless)
app.post("/api/generate-logo-design", async (req, res) => {
  try {
    const { brandName = "Inspira", slogan = "", industry = "Criatividade & Design", style = "luxury" } = req.body;

    const lowerIndustry = String(industry).toLowerCase();
    const lowerStyle = String(style).toLowerCase();

    // Map symbol based on industry & style
    let symbolId = "lotus-star";
    let primary = "#8B5CF6";
    let secondary = "#EC4899";
    let accent = "#F59E0B";
    let bg = "#080B11";
    let fontFamily = "'Playfair Display', serif";

    if (lowerIndustry.includes("tech") || lowerIndustry.includes("ia") || lowerIndustry.includes("software")) {
      symbolId = "circuit-mind";
      primary = "#06B6D4";
      secondary = "#3B82F6";
      accent = "#38BDF8";
      bg = "#030712";
      fontFamily = "'Plus Jakarta Sans', sans-serif";
    } else if (lowerIndustry.includes("luxo") || lowerIndustry.includes("joia") || lowerStyle.includes("lux")) {
      symbolId = "diamond-luxury";
      primary = "#F59E0B";
      secondary = "#D97706";
      accent = "#FEF3C7";
      bg = "#0B0F19";
      fontFamily = "'Playfair Display', serif";
    } else if (lowerIndustry.includes("saúde") || lowerIndustry.includes("eco") || lowerIndustry.includes("natureza")) {
      symbolId = "leaf-eco";
      primary = "#10B981";
      secondary = "#059669";
      accent = "#A7F3D0";
      bg = "#022C22";
      fontFamily = "'Montserrat', sans-serif";
    } else if (lowerIndustry.includes("segurança") || lowerIndustry.includes("finan") || lowerIndustry.includes("advoc")) {
      symbolId = "geometric-shield";
      primary = "#3B82F6";
      secondary = "#1D4ED8";
      accent = "#93C5FD";
      bg = "#050B14";
      fontFamily = "'Cinzel', serif";
    } else if (lowerStyle.includes("minimalist")) {
      symbolId = "zen-circle";
      primary = "#FFFFFF";
      secondary = "#94A3B8";
      accent = "#E2E8F0";
      bg = "#000000";
      fontFamily = "'Montserrat', sans-serif";
    }

    let logoStrategy = {
      conceptName: `Identidade Conceitual ${brandName}`,
      designRationale: `Design estruturado com foco em pregnância visual e memorabilidade para o nicho de ${industry}. Utiliza pesos equilibrados e geometria áurea para transmitir autoridade, elegância e inovação duradoura.`,
      suggestedColors: {
        primary,
        secondary,
        accent,
        background: bg,
      },
      symbolId,
      fontFamily,
      sloganFontFamily: "'Plus Jakarta Sans', sans-serif",
      layout: "vertical",
    };

    // Try fast Gemini model if available
    const ai = getAI();
    if (ai) {
      const prompt = `Atue como Diretor de Arte Internacional. Crie estratégia para logotipo da marca: ${brandName}, setor: ${industry}, estilo: ${style}. Retorne JSON rigoroso.`;
      const aiResponse = await generateContentFast(
        ai,
        "gemini-3.8-flash",
        prompt,
        {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              conceptName: { type: Type.STRING },
              designRationale: { type: Type.STRING },
              suggestedColors: {
                type: Type.OBJECT,
                properties: {
                  primary: { type: Type.STRING },
                  secondary: { type: Type.STRING },
                  accent: { type: Type.STRING },
                  background: { type: Type.STRING },
                },
                required: ["primary", "secondary", "accent", "background"],
              },
              symbolId: { type: Type.STRING },
              fontFamily: { type: Type.STRING },
              layout: { type: Type.STRING },
            },
            required: ["conceptName", "designRationale", "suggestedColors", "symbolId", "fontFamily", "layout"],
          },
        },
        2000
      );

      if (aiResponse && aiResponse.text) {
        try {
          const parsed = JSON.parse(aiResponse.text);
          logoStrategy = { ...logoStrategy, ...parsed };
        } catch {
          // ignore
        }
      }
    }

    res.json(logoStrategy);
  } catch (error: any) {
    console.error("Error in /api/generate-logo-design:", error);
    res.json({
      conceptName: "Identidade Inspira",
      designRationale: "Geometria equilibrada com contraste marcante e tipografia refinada para alta memorabilidade.",
      suggestedColors: {
        primary: "#8B5CF6",
        secondary: "#EC4899",
        accent: "#F59E0B",
        background: "#080B11",
      },
      symbolId: "lotus-star",
      fontFamily: "'Playfair Display', serif",
      sloganFontFamily: "'Plus Jakarta Sans', sans-serif",
      layout: "vertical",
    });
  }
});

// 7. Generate Complementary Color Palette (Mathematical Color Theory Engine - Keyless)
app.post("/api/generate-complementary-palette", async (req, res) => {
  const {
    mode = "theme",
    value = "Harmonia Criativa",
    base64Image,
    mimeType = "image/png",
    harmonyType = "complementary",
  } = req.body || {};

  // Mathematical color palette calculations
  let baseH = 260; // Violet
  const lowerVal = String(value).toLowerCase();
  if (lowerVal.includes("sol") || lowerVal.includes("ouro") || lowerVal.includes("amarel")) baseH = 40;
  else if (lowerVal.includes("oceano") || lowerVal.includes("azul") || lowerVal.includes("mar")) baseH = 200;
  else if (lowerVal.includes("floresta") || lowerVal.includes("verde") || lowerVal.includes("natureza")) baseH = 150;
  else if (lowerVal.includes("cyber") || lowerVal.includes("neon") || lowerVal.includes("rosa")) baseH = 320;
  else if (lowerVal.includes("fogo") || lowerVal.includes("rubi") || lowerVal.includes("vermelh")) baseH = 10;

  // Harmony shifts
  let compH = (baseH + 180) % 360;
  let accentH = (baseH + 60) % 360;
  if (harmonyType === "split-complementary") {
    compH = (baseH + 150) % 360;
    accentH = (baseH + 210) % 360;
  } else if (harmonyType === "triadic") {
    compH = (baseH + 120) % 360;
    accentH = (baseH + 240) % 360;
  } else if (harmonyType === "analogous-accent") {
    compH = (baseH + 30) % 360;
    accentH = (baseH + 180) % 360;
  } else if (harmonyType === "tetradic") {
    compH = (baseH + 90) % 360;
    accentH = (baseH + 180) % 360;
  }

  // Convert HSL to Hex
  function hslToHex(h: number, s: number, l: number): string {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
  }

  const primaryHex = hslToHex(baseH, 85, 60);
  const compHex = hslToHex(compH, 80, 52);
  const accentHex = hslToHex(accentH, 90, 55);
  const lightHex = hslToHex(baseH, 40, 94);
  const darkHex = hslToHex(compH, 45, 8);

  let result = {
    title: `Paleta ${harmonyType === "complementary" ? "Complementar" : "Harmônica"} - ${value || "Inspira"}`,
    harmonyType,
    source: mode,
    sourceValue: value || (mode === "image" ? "Imagem enviada" : "Tema criativo"),
    description:
      "Paleta cromática desenvolvida através dos princípios da roda de cores e contraste perceptual, equilibrando tonalidades dominantes com seus complementos exatos para máxima pregnância visual.",
    colors: [
      {
        hex: primaryHex,
        name: "Matiz Dominante",
        role: "Dominante / Base",
        rgb: `rgb(${parseInt(primaryHex.slice(1, 3), 16)}, ${parseInt(primaryHex.slice(3, 5), 16)}, ${parseInt(primaryHex.slice(5, 7), 16)})`,
        hsl: `hsl(${baseH}, 85%, 60%)`,
        isLight: false,
      },
      {
        hex: compHex,
        name: "Complemento Ótico",
        role: "Complementar Direta",
        rgb: `rgb(${parseInt(compHex.slice(1, 3), 16)}, ${parseInt(compHex.slice(3, 5), 16)}, ${parseInt(compHex.slice(5, 7), 16)})`,
        hsl: `hsl(${compH}, 80%, 52%)`,
        isLight: false,
      },
      {
        hex: accentHex,
        name: "Acento Dinâmico",
        role: "Acento Vibrante",
        rgb: `rgb(${parseInt(accentHex.slice(1, 3), 16)}, ${parseInt(accentHex.slice(3, 5), 16)}, ${parseInt(accentHex.slice(5, 7), 16)})`,
        hsl: `hsl(${accentH}, 90%, 55%)`,
        isLight: true,
      },
      {
        hex: lightHex,
        name: "Luz de Superfície",
        role: "Superfície / Cartão",
        rgb: `rgb(${parseInt(lightHex.slice(1, 3), 16)}, ${parseInt(lightHex.slice(3, 5), 16)}, ${parseInt(lightHex.slice(5, 7), 16)})`,
        hsl: `hsl(${baseH}, 40%, 94%)`,
        isLight: true,
      },
      {
        hex: darkHex,
        name: "Obsidiana de Fundo",
        role: "Profundidade / Fundo",
        rgb: `rgb(${parseInt(darkHex.slice(1, 3), 16)}, ${parseInt(darkHex.slice(3, 5), 16)}, ${parseInt(darkHex.slice(5, 7), 16)})`,
        hsl: `hsl(${compH}, 45%, 8%)`,
        isLight: false,
      },
    ],
  };

  // Try fast Gemini model if available
  const ai = getAI();
  if (ai) {
    try {
      const promptText = `Atue como Especialista em Teoria das Cores. Crie paleta de 5 cores para: ${value}. Tipo: ${harmonyType}. Retorne JSON com title, description e colors (array com hex, name, role, rgb, hsl, isLight).`;
      const aiResponse = await generateContentFast(
        ai,
        "gemini-3.8-flash",
        promptText,
        {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              colors: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    hex: { type: Type.STRING },
                    name: { type: Type.STRING },
                    role: { type: Type.STRING },
                    rgb: { type: Type.STRING },
                    hsl: { type: Type.STRING },
                    isLight: { type: Type.BOOLEAN },
                  },
                  required: ["hex", "name", "role", "rgb", "hsl", "isLight"],
                },
              },
            },
            required: ["title", "description", "colors"],
          },
        },
        2000
      );

      if (aiResponse && aiResponse.text) {
        const parsed = JSON.parse(aiResponse.text);
        if (parsed.colors && parsed.colors.length >= 4) {
          result = { ...result, ...parsed };
        }
      }
    } catch {
      // ignore
    }
  }

  res.json(result);
});

// Vite Middleware & Static Serving
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Inspira Arte Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
