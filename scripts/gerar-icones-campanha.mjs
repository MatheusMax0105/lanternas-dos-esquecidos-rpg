import assert from "node:assert/strict";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";
import { ClassicLevel } from "classic-level";

const BASE = "systems/ordem-paranormal-2e/assets/icons";
const PALETTE = {
  ink: "#171310",
  gold: "#c5a45d",
  pale: "#e9d8a8",
  jade: "#6d9581",
  red: "#963c32",
  paper: "#d9c99f",
  shadow: "#44352a",
};

const OCUPACOES = new Set([
  "Monge Taoísta", "Monge Budista", "Escriba Imperial", "Astrólogo Imperial", "Herbalista",
  "Curandeiro Ambulante", "Fabricante de Incenso", "Criador de Lanternas", "Guardião de Tumbas",
  "Coveiro Ritualista", "Caçador das Montanhas", "Lenhador", "Pescador de Rio", "Barqueiro",
  "Mensageiro Imperial", "Mercador Itinerante", "Ferreiro", "Artesão de Jade", "Carpinteiro",
  "Oleiro", "Guarda da Muralha", "Ex-Soldado da Fronteira", "Batedor Militar", "Oficial Local",
  "Coletor de Impostos", "Diplomata Provincial", "Narrador de Lendas", "Músico Ritual",
  "Calígrafo", "Mestre de Funerais",
]);

const PICTOGRAMAS = {
  lantern: `<path d="M92 75h72l-8 20v69h-56V95z"/><path d="M99 105h58M101 146h54M109 164l-8 22h54l-9-22M111 75q17-28 34 0M128 95v20"/>`,
  bell: `<path d="M90 151q12-12 14-50 2-31 24-31t24 31q2 38 14 50z"/><path d="M83 153h90M116 167q12 18 24 0M128 52v13"/>`,
  mirror: `<circle cx="128" cy="111" r="52"/><circle cx="128" cy="111" r="39"/><path d="M113 159l-10 34h50l-10-34M128 77v68M94 111h68M104 87l48 48M152 87l-48 48"/>`,
  incense: `<path d="M91 166h74M103 166V87M128 166V66M153 166V91"/><path d="M94 72q-12-12 0-23t0-22M128 51q-12-12 0-23t0-22M160 75q-12-12 0-23t0-22"/>`,
  book: `<path d="M72 71q31-13 56 7v106q-25-20-56-7zM184 71q-31-13-56 7v106q25-20 56-7z"/><path d="M86 98q16-5 29 3M86 119q16-5 29 3M170 98q-16-5-29 3M170 119q-16-5-29 3M128 78v104"/>`,
  compass: `<circle cx="128" cy="120" r="57"/><circle cx="128" cy="120" r="44"/><path d="M128 70l12 50-12 49-12-49z"/><path d="M128 63v12M128 165v12M71 120h12M173 120h12"/>`,
  starwheel: `<circle cx="128" cy="119" r="51"/><circle cx="128" cy="119" r="8"/><path d="M128 60v118M69 119h118M86 77l84 84M170 77l-84 84"/><circle cx="128" cy="67" r="5"/><circle cx="176" cy="119" r="5"/><circle cx="128" cy="171" r="5"/><circle cx="80" cy="119" r="5"/>`,
  mask: `<path d="M82 78q46-28 92 0v44q-5 43-46 61-41-18-46-61z"/><path d="M99 111q12-12 24 0M133 111q12-12 24 0M115 144q13 9 26 0M128 112l-7 22h14z"/>`,
  box: `<path d="M78 93h100v76H78zM70 78h116v18H70zM117 96v72M139 96v72"/><path d="M128 78v-18q17-17 30 0-13 14-30 0-17 17-30 0 13-17 30 0"/>`,
  herbs: `<path d="M128 175q-5-54-43-93 54 4 54 49M129 144q20-48 61-56-12 46-61 66M127 173q-28-38-68-35 22 38 68 45M128 177v-92"/>`,
  needles: `<path d="M86 163l70-82M103 174l70-82M120 185l70-82"/><circle cx="82" cy="167" r="5"/><circle cx="99" cy="178" r="5"/><circle cx="116" cy="189" r="5"/>`,
  brush: `<path d="M89 161l73-73 14 14-73 73-25 11zM154 82l15-16 20 20-16 15"/><path d="M71 181l18-6M112 140l15 15"/>`,
  hammer: `<path d="M128 92v105M88 73h80v34H88zM77 67h102v10H77z"/>`,
  spear: `<path d="M128 52v151M128 52q-31 24 0 52 31-28 0-52z"/>`,
  rope: `<path d="M84 160q-21-26 5-49l58-54q24-18 40 4t-4 42l-58 54q-24 18-41 3z"/><path d="M100 150l68-65M111 164l68-65M88 137l67-64"/>`,
  shovel: `<path d="M127 59v94M116 60h22M127 153q-34 2-34 26 0 16 34 20 34-4 34-20 0-24-34-26z"/>`,
  plaque: `<path d="M89 70h78v113H89zM99 84h58v83h-58z"/><path d="M112 105q16-16 32 0t-16 28q-16-12 0-28zM107 151h42"/>`,
  hourglass: `<path d="M92 62h72M92 190h72M99 68q0 32 29 58-29 27-29 58M157 68q0 32-29 58 29 27 29 58"/><path d="M112 91h32M114 159h28"/>`,
  candle: `<path d="M100 93h56v85h-56zM108 178h40v13h-40z"/><path d="M128 88q-21-18 0-39 21 21 0 39zM128 60v-9"/>`,
  paper: `<path d="M83 61h75l23 24v111H83zM158 61v25h23M101 111h61M101 132h61M101 153h44"/>`,
  ribbon: `<path d="M84 86q44-31 88 0v58q-44 31-88 0zM84 100q44 31 88 0M84 131q44-31 88 0"/><path d="M92 155l-8 34 44-18 44 18-8-34"/>`,
  bowl: `<path d="M76 118h104q-7 55-52 55t-52-55zM87 111q41-19 82 0M99 184h58"/><path d="M108 97q-10-11 0-22M128 94q-10-11 0-22M148 97q-10-11 0-22"/>`,
  gourd: `<path d="M128 80q-24-27 0-42 24 15 0 42 39-12 47 26 8 40-47 73-55-33-47-73 8-38 47-26z"/><path d="M128 39v-9M103 106q25 12 50 0"/>`,
  jar: `<path d="M105 69h46v18q27 19 27 57 0 41-50 41t-50-41q0-38 27-57z"/><path d="M100 67h56M91 123h74M107 91q21 12 42 0"/>`,
  salve: `<path d="M94 104h68v72H94zM103 89h50v16h-50zM112 73h32v16h-32z"/><path d="M108 139q20-22 40 0-20 22-40 0z"/>`,
  poultice: `<path d="M86 105q42-37 84 0v57q-42 36-84 0z"/><path d="M97 118q31-23 62 0M97 143q31 23 62 0M128 101v66"/>`,
  fish: `<path d="M71 128q41-49 90 0-49 49-90 0zM161 128l31-27v54z"/><circle cx="100" cy="119" r="5"/><path d="M122 105l14 23-14 23"/>`,
  driedfood: `<path d="M78 111q50-55 100 0-50 63-100 0z"/><path d="M93 111q35-25 70 0M106 119q22-30 44 0M128 97v40"/>`,
  scroll: `<path d="M88 74h76v112H88zM78 70h96v16H78zM78 174h96v16H78z"/><path d="M104 110h44M104 130h44M104 150h32"/>`,
  bottle: `<path d="M113 61h30v30q29 21 29 63 0 35-44 35t-44-35q0-42 29-63z"/><path d="M108 61h40M94 132h68"/>`,
};

const TINTS = [
  ["gold", "pale"], ["jade", "gold"], ["red", "paper"], ["paper", "jade"],
  ["gold", "red"], ["jade", "paper"], ["pale", "red"],
];

function normalizar(texto) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function categoria(tipo) {
  return ({
    ocupacoes: "ocupacoes",
    habilidades: "habilidades",
    "armas-campanha": "armas",
    "ferramentas-campanha": "ferramentas",
    "consumiveis-campanha": "consumiveis",
  })[tipo];
}

function motifFor(tipo, nome, slug) {
  const texto = normalizar(`${nome} ${slug}`);
  if (tipo === "armas-campanha") {
    if (/arco/.test(texto)) return `<path d="M83 60q92 68 0 136M83 60l88 68-88 68M83 60v136"/><path d="M171 128l-18-8 8 8-8 8z"/>`;
    if (/besta/.test(texto)) return `<path d="M128 57v142M75 93q53 55 106 0M83 93h90M118 125h20l-5 44h-10zM128 82v28"/>`;
    if (/lanca|alabarda/.test(texto)) return `<path d="M128 53v150M128 53q-27 22 0 51 27-29 0-51z"/>${/alabarda/.test(texto) ? `<path d="M128 99h44q-7 28-44 23"/>` : ""}`;
    if (/machado|foice/.test(texto)) return `<path d="M128 86v111M128 91q-48-36-54 9 24 22 54 9M128 91q40-32 54-3-7 30-54 23"/>`;
    if (/martelo/.test(texto)) return `<path d="M128 90v107M89 73h78v36H89zM76 67h104v12H76z"/>`;
    if (/gancho/.test(texto)) return `<path d="M119 62v127M119 62h33q34 0 24 36-7 24-37 17"/>`;
    if (/bastao/.test(texto)) return `<path d="M128 54v148M111 66h34M111 190h34"/>`;
    if (/faca|adaga/.test(texto)) return `<path d="M128 54q-37 63 0 111 37-48 0-111zM128 163v38M105 160h46"/>`;
    if (/jian/.test(texto)) return `<path d="M128 50q-28 68 0 120 28-52 0-120zM128 170v31M103 164h50M118 194h20"/>`;
    return `<path d="M128 52q-43 70 0 130 43-60 0-130zM128 178v24M102 171h52M117 198h22"/>`;
  }
  if (tipo === "ocupacoes") {
    const prop = /monge|taoista|budista/.test(texto) ? "bell" :
      /escriba|caligrafo|diplomata|oficial|impostos/.test(texto) ? "brush" :
      /astrologo/.test(texto) ? "starwheel" :
      /herbalista|curandeiro/.test(texto) ? "herbs" :
      /incenso/.test(texto) ? "incense" :
      /lanterna/.test(texto) ? "lantern" :
      /tumba|coveiro|funerais/.test(texto) ? "plaque" :
      /cacador|batedor|soldado|guarda/.test(texto) ? "spear" :
      /lenhador|ferreiro|carpinteiro/.test(texto) ? "hammer" :
      /pescador|barqueiro/.test(texto) ? "fish" :
      /mercador|coletor/.test(texto) ? "box" :
      /jade/.test(texto) ? "mirror" :
      /oleiro/.test(texto) ? "bowl" :
      /mensageiro/.test(texto) ? "scroll" :
      /musico/.test(texto) ? "bell" :
      /narrador/.test(texto) ? "book" : "lantern";
    return `${portrait()}${PICTOGRAMAS[prop] ?? PICTOGRAMAS.lantern}`;
  }
  if (tipo === "habilidades") {
    if (/descoberta|avaliacao|olhar|varredura/.test(texto)) return `${PICTOGRAMAS.mirror}<circle cx="168" cy="85" r="8"/>`;
    if (/tecnico|conta|formacao|avaliacao/.test(texto)) return `${PICTOGRAMAS.compass}${PICTOGRAMAS.brush}`;
    if (/corrente|retorno|travessia/.test(texto)) return `<path d="M78 124q24-62 55 0t55 0M78 145q24-62 55 0t55 0"/>${PICTOGRAMAS.rope}`;
    if (/ferro|foco|estoico|promessa|disciplina/.test(texto)) return `${PICTOGRAMAS.plaque}<path d="M128 83v66M95 116h66"/>`;
    if (/fumo|cinzas|neblina|sinais/.test(texto)) return `<path d="M83 155q-27-24 0-44t0-41M128 155q-27-24 0-44t0-41M173 155q-27-24 0-44t0-41"/>${PICTOGRAMAS.incense}`;
    if (/livro|historia|memoria|linhagem|ancestrais|testemunha|nome/.test(texto)) return `${PICTOGRAMAS.book}${PICTOGRAMAS.plaque}`;
    if (/impeto|ritmo|pulso|respiracao|incansavel|prontidao/.test(texto)) return `<path d="M70 126h38l18-38 20 78 19-40h22"/><circle cx="128" cy="127" r="57"/>`;
    if (/medicinal|herbario|terra|veios/.test(texto)) return `${PICTOGRAMAS.herbs}<path d="M128 172v26"/>`;
    if (/palavra|voz|rosto|paz|mentoria/.test(texto)) return `${PICTOGRAMAS.mask}<path d="M93 184q35 22 70 0"/>`;
    if (/rastro|ausencias/.test(texto)) return `<path d="M80 164q12-30 24 0t24 0 24 0 24 0M85 177h86"/><circle cx="92" cy="130" r="7"/><circle cx="127" cy="111" r="7"/><circle cx="164" cy="92" r="7"/>`;
    return `${PICTOGRAMAS.starwheel}${PICTOGRAMAS.paper}`;
  }
  if (tipo === "ferramentas-campanha") {
    if (/lanterna/.test(texto)) return PICTOGRAMAS.lantern;
    if (/sino/.test(texto)) return PICTOGRAMAS.bell;
    if (/espelho/.test(texto)) return PICTOGRAMAS.mirror;
    if (/incenso|relogio/.test(texto)) return /relogio/.test(texto) ? PICTOGRAMAS.hourglass : PICTOGRAMAS.incense;
    if (/livro|linhagens|registros/.test(texto)) return PICTOGRAMAS.book;
    if (/bussola/.test(texto)) return PICTOGRAMAS.compass;
    if (/astrolabio/.test(texto)) return PICTOGRAMAS.starwheel;
    if (/mascara/.test(texto)) return PICTOGRAMAS.mask;
    if (/caixa|ofrendas|selos/.test(texto)) return PICTOGRAMAS.box;
    if (/erva|agulha/.test(texto)) return /agulha/.test(texto) ? PICTOGRAMAS.needles : PICTOGRAMAS.herbs;
    if (/caligrafia|inscricoes/.test(texto)) return PICTOGRAMAS.brush;
    if (/rastreamento/.test(texto)) return PICTOGRAMAS.compass;
    if (/corda/.test(texto)) return PICTOGRAMAS.rope;
    if (/escavacao/.test(texto)) return PICTOGRAMAS.shovel;
    if (/placas/.test(texto)) return PICTOGRAMAS.plaque;
  }
  if (tipo === "consumiveis-campanha") {
    if (/cha|tisana|infusao|decoccao|caldo/.test(texto)) return PICTOGRAMAS.bowl;
    if (/emplastro|compressa|cataplasma/.test(texto)) return PICTOGRAMAS.poultice;
    if (/balsamo|unguento|pomada/.test(texto)) return PICTOGRAMAS.salve;
    if (/erva|semente/.test(texto)) return PICTOGRAMAS.herbs;
    if (/incenso/.test(texto)) return PICTOGRAMAS.incense;
    if (/vela/.test(texto)) return PICTOGRAMAS.candle;
    if (/papel|carvao|tinta/.test(texto)) return PICTOGRAMAS.paper;
    if (/racao|arroz/.test(texto)) return PICTOGRAMAS.bowl;
    if (/agua|cabaca/.test(texto)) return PICTOGRAMAS.gourd;
    if (/carne/.test(texto)) return PICTOGRAMAS.driedfood;
    if (/fita/.test(texto)) return PICTOGRAMAS.ribbon;
    return PICTOGRAMAS.jar;
  }
  return PICTOGRAMAS.lantern;
}

function portrait() {
  return `<path d="M91 102q0-42 37-42t37 42q-3 28-37 40-34-12-37-40z"/>
    <path d="M72 202q5-47 56-53 51 6 56 53z"/>
    <path d="M92 87q36-44 73 0M98 108q9-8 18 0M140 108q9-8 18 0M116 126q12 7 24 0"/>
    <path d="M106 157l22 28 22-28M128 185v17"/>`;
}

function marcaUnica(indice, cor) {
  let codigo = indice;
  const marcas = Array.from({ length: 3 }, (_, indiceMarca) => {
    const valor = codigo % 7;
    codigo = Math.floor(codigo / 7);
    const x = 112 + indiceMarca * 16;
    const glifo = [
      `<circle cx="${x}" cy="207" r="3"/>`,
      `<path d="M${x} 203l4 4-4 4-4-4z"/>`,
      `<path d="M${x} 203v8M${x - 3} 207h6"/>`,
      `<path d="M${x - 3} 204l6 6M${x + 3} 204l-6 6"/>`,
      `<path d="M${x - 3} 210l3-6 3 6"/>`,
      `<path d="M${x} 203l3 2-1 4-2 2-2-2-1-4z"/>`,
      `<path d="M${x - 4} 207q4-6 8 0-4 6-8 0z"/>`,
    ][valor];
    return glifo;
  });
  return `<g fill="none" stroke="${cor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${marcas.join("")}</g>`;
}

function iconSvg({ tipo, nome, slug, index }) {
  const folder = categoria(tipo);
  const [mainKey, highlightKey] = TINTS[index % TINTS.length];
  const main = PALETTE[mainKey];
  const highlight = PALETTE[highlightKey];
  const center = motifFor(tipo, nome, slug);
  const variant = index % 4;
  const filigree = variant === 0
    ? `<path d="M128 15c7 12 7 22 0 31-7-9-7-19 0-31zM128 210c7 12 7 22 0 31-7-9-7-19 0-31z"/>`
    : variant === 1
      ? `<path d="M25 128q15-9 24 0-9 9-24 0zM207 128q15-9 24 0-9 9-24 0z"/>`
      : variant === 2
        ? `<path d="M52 55q18 1 24 18-18-1-24-18zM180 183q18 1 24 18-18-1-24-18z"/>`
        : `<path d="M52 201q1-18 18-24-1 18-18 24zM180 73q1-18 18-24-1 18-18 24z"/>`;
  const path = join("assets/icons", folder, `${slug}.webp`);
  return {
    path,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
      <defs>
        <linearGradient id="metal" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="${PALETTE.pale}"/><stop offset=".5" stop-color="${main}"/><stop offset="1" stop-color="${PALETTE.shadow}"/>
        </linearGradient>
        <radialGradient id="jade"><stop stop-color="${highlight}" stop-opacity=".32"/><stop offset="1" stop-color="${highlight}" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="128" cy="128" r="113" fill="url(#jade)"/>
      <circle cx="128" cy="128" r="101" fill="none" stroke="${PALETTE.shadow}" stroke-width="2" opacity=".7"/>
      <circle cx="128" cy="128" r="94" fill="none" stroke="url(#metal)" stroke-width="2.5"/>
      <circle cx="128" cy="128" r="86" fill="none" stroke="${PALETTE.gold}" stroke-width="1" stroke-dasharray="${variant + 3} 7" opacity=".8"/>
      <path d="M128 26v14M128 216v14M26 128h14M216 128h14" stroke="${PALETTE.red}" stroke-width="3"/>
      <g fill="none" stroke="${main}" stroke-width="3.3" stroke-linecap="round" stroke-linejoin="round">${center}</g>
      <g fill="none" stroke="${highlight}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity=".95">${filigree}</g>
      ${marcaUnica(index, PALETTE.gold)}
      <circle cx="128" cy="128" r="4" fill="${PALETTE.red}"/>
      <circle cx="128" cy="19" r="2" fill="${PALETTE.gold}"/><circle cx="237" cy="128" r="2" fill="${PALETTE.gold}"/>
      <circle cx="128" cy="237" r="2" fill="${PALETTE.gold}"/><circle cx="19" cy="128" r="2" fill="${PALETTE.gold}"/>
    </svg>`,
  };
}

async function lerItens(pastaFonte, tipo) {
  const arquivos = readdirSync(pastaFonte).filter((arquivo) => arquivo.endsWith(".json"));
  const itens = arquivos.map((arquivo) => ({
    arquivo,
    caminhoFonte: join(pastaFonte, arquivo),
    documento: JSON.parse(readFileSync(join(pastaFonte, arquivo), "utf8")),
  }));
  return tipo === "ocupacoes"
    ? itens.filter(({ documento }) => OCUPACOES.has(documento.name))
    : itens;
}

const grupos = [
  ["packs/sources/ocupacoes", "ocupacoes"],
  ["packs/sources/habilidades", "habilidades"],
  ["packs/sources/armas-campanha", "armas-campanha"],
  ["packs/sources/ferramentas-campanha", "ferramentas-campanha"],
  ["packs/sources/consumiveis-campanha", "consumiveis-campanha"],
];

const itens = [];
for (const [fonte, grupo] of grupos) {
  const registros = await lerItens(fonte, grupo);
  itens.push(...registros.map((registro) => ({ ...registro, grupo })));
}

const slugs = new Set();
const ids = new Set();
for (const [index, item] of itens.entries()) {
  const slug = item.arquivo.replace(/\.json$/i, "").toLowerCase();
  const pasta = categoria(item.grupo);
  const destino = join("assets/icons", pasta, `${slug}.webp`);
  assert.ok(!slugs.has(destino), `Ícone duplicado: ${destino}`);
  assert.ok(!ids.has(item.documento._id), `ID de item duplicado: ${item.documento._id}`);
  slugs.add(destino);
  ids.add(item.documento._id);
  item.slug = slug;
  item.index = index;
  item.caminhoIcone = destino;
  item.img = `${BASE}/${pasta}/${slug}.webp`;
}
assert.equal(itens.length, 146, `Esperados 146 itens, encontrados ${itens.length}`);

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 256, height: 256 } });
  for (const item of itens) {
    mkdirSync(join("assets/icons", categoria(item.grupo)), { recursive: true });
    const { path, svg } = iconSvg({
      tipo: item.grupo,
      nome: item.documento.name,
      slug: item.slug,
      index: item.index,
    });
    const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
    const webp = await page.evaluate(async (source) => {
      const image = new Image();
      image.src = source;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;
      const context = canvas.getContext("2d", { alpha: true });
      context.clearRect(0, 0, 256, 256);
      context.drawImage(image, 0, 0, 256, 256);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", 0.94));
      if (!blob) throw new Error("Falha ao codificar ícone WebP.");
      return [...new Uint8Array(await blob.arrayBuffer())];
    }, dataUrl);
    writeFileSync(path, Buffer.from(webp));
    const parsed = JSON.parse(readFileSync(item.caminhoFonte, "utf8"));
    parsed.img = item.img;
    writeFileSync(item.caminhoFonte, `${JSON.stringify(parsed, null, 2)}\n`);
  }
} finally {
  await browser.close();
}

const packs = new Map([
  ["ocupacoes", "packs/ocupacoes"],
  ["habilidades", "packs/habilidades"],
  ["armas-campanha", "packs/armas-campanha"],
  ["ferramentas-campanha", "packs/ferramentas-campanha"],
  ["consumiveis-campanha", "packs/consumiveis-campanha"],
]);
for (const [grupo, caminho] of packs) {
  const packItens = itens.filter((item) => item.grupo === grupo);
  const db = new ClassicLevel(caminho, { valueEncoding: "json" });
  await db.open();
  try {
    const lote = db.batch();
    for (const item of packItens) {
      const { _key, ...documento } = JSON.parse(readFileSync(item.caminhoFonte, "utf8"));
      lote.put(_key, documento);
    }
    await lote.write();
    for (const item of packItens) {
      const documento = JSON.parse(readFileSync(item.caminhoFonte, "utf8"));
      const armazenado = await db.get(documento._key);
      assert.equal(armazenado.img, item.img, `Ícone do pack não atualizado: ${documento.name}`);
    }
  } finally {
    await db.close();
  }
}

console.log(`Ícones criados: ${itens.length} WebP 256x256 com transparência.`);
for (const grupo of ["ocupacoes", "habilidades", "armas-campanha", "ferramentas-campanha", "consumiveis-campanha"]) {
  console.log(`${grupo}: ${itens.filter((item) => item.grupo === grupo).length}`);
}
