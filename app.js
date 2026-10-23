const STORAGE_KEY = "airu-skin-maker-themes-v1";
const SNAPSHOT_STORAGE_KEY = "airu-skin-maker-snapshots-v1";

const layouts = [
  ["vintageHiFi", "Vintage Hi-Fi (Pioneer / Sansui)"],
  ["marantzGyro", "Marantz Gyro-Touch 1977"],
  ["mcIntoshTubes", "McIntosh Glass & Tubes"],
  ["reelToReel", "Studer Reel-to-Reel Tape"],
  ["broadcastStudio", "Broadcast Studio Pro"],
  ["cyberSynthwave", "Cyber Synthwave 80s"],
  ["retroWalkman", "Retro Walkman WM-D6C"],
  ["braunSK4", "Braun SK4 Dieter Rams 1956"],
  ["nagraIVS", "Nagra IV-S Swiss Field Recorder"],
  ["sonyBoombox", "Sony CFD-5 Boombox 1980s"],
  ["audiophileDAP", "Audiophile DAP Hi-Res"],
  ["neoHud", "Neo HUD Cockpit"],
  ["spatialGlass", "Spatial Glass Vision"],
  ["minimalistZen", "Minimalist Zen"],
  ["waveStream", "WaveStream Liquid"],
  ["elettraFM", "Elettra FM Valvular"],
  ["airu", "Airu Flagship Modern"],
  ["classic", "Classic Clean List"],
];

const palettes = {
  amber: { accentColorHex: "f59e0b", backgroundColorHex: "0f172a", surfaceColorHex: "1e293b", secondaryColorHex: "fbbf24", needleColorHex: "ef4444", backlightColorHex: "fbbf24" },
  sapphire: { accentColorHex: "38bdf8", backgroundColorHex: "0a0f1d", surfaceColorHex: "162235", secondaryColorHex: "0284c7", needleColorHex: "f97316", backlightColorHex: "0ea5e9" },
  emerald: { accentColorHex: "10b981", backgroundColorHex: "050b08", surfaceColorHex: "0e1f16", secondaryColorHex: "34d399", needleColorHex: "06b6d4", backlightColorHex: "10b981" },
};

const fields = ["name", "author", "version", "id", "descriptionText", "eraTag", "category", "baseLayoutRaw", "accentColorHex", "backgroundColorHex", "surfaceColorHex", "secondaryColorHex", "needleColorHex", "backlightColorHex"];
const colorFields = ["accentColorHex", "backgroundColorHex", "surfaceColorHex", "secondaryColorHex", "needleColorHex", "backlightColorHex"];
const defaults = {
  id: `novo_tema_${Date.now()}`,
  name: "Novo Tema Hi-Fi",
  author: "InfoReis Audiophile Lab",
  version: "1.0",
  descriptionText: "Descrição do novo visual analógico personalizado para o Airu.",
  eraTag: "1970s",
  category: "Analógico & Vintage",
  baseLayoutRaw: "vintageHiFi",
  accentColorHex: "f59e0b",
  backgroundColorHex: "0f172a",
  surfaceColorHex: "1e293b",
  secondaryColorHex: "fbbf24",
  needleColorHex: "ef4444",
  backlightColorHex: "fbbf24",
  isOfficial: true,
  dateAdded: new Date().toISOString(),
};

const form = document.querySelector("#theme-form");
const list = document.querySelector("#theme-list");
const message = document.querySelector("#message");
const layoutSelect = document.querySelector("#layout-select");
let themes = loadThemes();
let selectedId = themes[0].id;
let deferredInstallPrompt;

for (const [id, label] of layouts) {
  const option = document.createElement("option");
  option.value = id;
  option.textContent = label;
  layoutSelect.append(option);
}

function loadThemes() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [{ ...defaults }];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("A biblioteca guardada não contém temas válidos.");
    return parsed.map(validateTheme);
  } catch (error) {
    const status = document.querySelector("#save-status");
    if (status) status.textContent = "Não foi possível carregar temas";
    console.error("Falha ao carregar biblioteca local:", error);
    return [{ ...defaults }];
  }
}

function validateTheme(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("O ficheiro não contém um tema JSON válido.");
  const theme = { ...defaults, ...value };
  if (typeof theme.id !== "string" || !/^[a-zA-Z0-9_-]{1,80}$/.test(theme.id)) throw new Error("O identificador do tema é inválido.");
  if (typeof theme.name !== "string" || !theme.name.trim()) throw new Error("O tema precisa de um nome.");
  if (theme.secondaryColorHex == null) theme.secondaryColorHex = theme.accentColorHex;
  if (theme.needleColorHex == null) theme.needleColorHex = "ef4444";
  if (theme.backlightColorHex == null) theme.backlightColorHex = "f59e0b";
  for (const key of colorFields) {
    if (typeof theme[key] !== "string" || !/^[0-9a-fA-F]{6}$/.test(theme[key])) throw new Error(`A cor ${key} deve conter seis dígitos hexadecimais.`);
    theme[key] = theme[key].toLowerCase();
  }
  if (!layouts.some(([layout]) => layout === theme.baseLayoutRaw)) throw new Error("O estilo de layout não é reconhecido.");
  if (typeof theme.dateAdded !== "string" && theme.dateAdded !== null) theme.dateAdded = new Date().toISOString();
  return theme;
}

function saveThemes() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(themes));
    document.querySelector("#save-status").textContent = "Guardado neste dispositivo";
    return true;
  } catch (error) {
    document.querySelector("#save-status").textContent = "Erro ao guardar";
    showMessage(`Não foi possível guardar no navegador: ${error.message}`, true);
    console.error("Falha ao guardar biblioteca local:", error);
    return false;
  }
}

function selectedTheme() {
  return themes.find((theme) => theme.id === selectedId);
}

function showMessage(text, isError = false) {
  message.textContent = text;
  message.classList.toggle("error", isError);
}

function renderList() {
  const query = document.querySelector("#search-input").value.trim().toLocaleLowerCase("pt");
  list.replaceChildren();
  const visibleThemes = themes.filter((theme) => [theme.name, theme.id, theme.eraTag, theme.author].some((value) => String(value ?? "").toLocaleLowerCase("pt").includes(query)));
  document.querySelector("#theme-count").textContent = String(themes.length);
  if (visibleThemes.length === 0) {
    const item = document.createElement("li");
    item.className = "empty-list";
    item.textContent = query ? "Nenhum tema corresponde à pesquisa." : "Ainda não há temas nesta biblioteca.";
    list.append(item);
    return;
  }
  for (const theme of visibleThemes) {
    const item = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-current", String(theme.id === selectedId));
    button.addEventListener("click", () => {
      selectedId = theme.id;
      render();
      showMessage("");
    });
    const thumb = document.createElement("span");
    thumb.className = "theme-thumb";
    thumb.style.background = `linear-gradient(135deg, #${theme.backgroundColorHex}, #${theme.surfaceColorHex})`;
    thumb.style.color = `#${theme.accentColorHex}`;
    thumb.textContent = "A";
    const details = document.createElement("span");
    const name = document.createElement("strong");
    name.textContent = theme.name;
    const era = document.createElement("small");
    era.textContent = `${theme.eraTag} · ${theme.baseLayoutRaw}`;
    details.append(name, era);
    button.append(thumb, details);
    item.append(button);
    list.append(item);
  }
}

function renderEditor(theme) {
  for (const key of fields) {
    const control = form.elements.namedItem(key);
    if (control) control.value = key.endsWith("ColorHex") ? `#${theme[key]}` : (theme[key] ?? "");
  }
  for (const key of colorFields) {
    document.querySelector(`[data-hex-for="${key}"]`).textContent = `#${theme[key]}`;
  }
}

function renderPreview(theme) {
  document.querySelector("#preview-title").textContent = theme.name;
  document.querySelector("#preview-era").textContent = `${theme.eraTag} · HI-FI`;
  document.querySelector("#preview-layout").textContent = layouts.find(([id]) => id === theme.baseLayoutRaw)?.[1] ?? theme.baseLayoutRaw;
  document.querySelector("#preview-id").textContent = theme.id;
  const receiver = document.querySelector("#receiver");
  for (const [property, field] of [["--chassis", "backgroundColorHex"], ["--surface", "surfaceColorHex"], ["--accent", "accentColorHex"], ["--secondary", "secondaryColorHex"], ["--needle", "needleColorHex"], ["--backlight", "backlightColorHex"]]) {
    receiver.style.setProperty(property, `#${theme[field]}`);
  }
}

function render() {
  const theme = selectedTheme();
  if (!theme) return;
  renderList();
  renderEditor(theme);
  renderPreview(theme);
  document.querySelector("#delete-button").disabled = themes.length < 2;
  if (document.querySelector("#studio-dialog").open) renderActiveTool();
}

function updateSelectedTheme() {
  const previous = selectedTheme();
  if (!previous) return;
  const next = { ...previous };
  for (const key of fields) {
    const control = form.elements.namedItem(key);
    next[key] = control.value;
    if (key.endsWith("ColorHex")) next[key] = control.value.slice(1).toLowerCase();
  }
  if (!form.reportValidity()) return;
  if (!/^[a-zA-Z0-9_-]{1,80}$/.test(next.id)) {
    showMessage("O identificador só pode conter letras, números, hífen e underscore.", true);
    form.elements.namedItem("id").focus();
    return;
  }
  if (themes.some((theme) => theme.id === next.id && theme !== previous)) {
    showMessage("Já existe um tema com este identificador.", true);
    form.elements.namedItem("id").focus();
    return;
  }
  themes = themes.map((theme) => theme === previous ? next : theme);
  selectedId = next.id;
  saveThemes();
  render();
}

function createTheme(source = defaults, duplicate = false) {
  const copy = { ...source };
  copy.id = duplicate ? `${source.id}_copia` : `novo_tema_${Date.now()}`;
  let suffix = 2;
  const baseId = copy.id;
  while (themes.some((theme) => theme.id === copy.id)) copy.id = `${baseId}_${suffix++}`;
  copy.name = duplicate ? `${source.name} (cópia)` : "Novo Tema Hi-Fi";
  copy.dateAdded = new Date().toISOString();
  if (!duplicate) Object.assign(copy, defaults, { id: copy.id, name: copy.name, dateAdded: copy.dateAdded });
  themes.unshift(copy);
  selectedId = copy.id;
  if (!saveThemes()) {
    render();
    return;
  }
  render();
  showMessage(duplicate ? "Tema duplicado." : "Novo tema criado.");
}

function downloadTheme(theme) {
  const data = { ...theme };
  const blob = new Blob([`${JSON.stringify(data, null, 2)}\n`], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${theme.id}.json`;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  showMessage("JSON exportado.");
}

function hexToHsl(hex) {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16) / 255;
  const g = parseInt(value.slice(2, 4), 16) / 255;
  const b = parseInt(value.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let h = 0;
  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h = (h * 60 + 360) % 360;
  }
  return { h, s, l };
}

function hslToHex(h, s, l) {
  const hue = ((h % 360) + 360) % 360;
  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const x = chroma * (1 - Math.abs((hue / 60) % 2 - 1));
  const m = l - chroma / 2;
  const rgb = hue < 60 ? [chroma, x, 0] : hue < 120 ? [x, chroma, 0] : hue < 180 ? [0, chroma, x] : hue < 240 ? [0, x, chroma] : hue < 300 ? [x, 0, chroma] : [chroma, 0, x];
  return rgb.map((channel) => Math.round((channel + m) * 255).toString(16).padStart(2, "0")).join("");
}

function harmonyPalette(theme = selectedTheme()) {
  const warmth = Number(document.querySelector("#warmth-range").value) / 100;
  const saturation = Number(document.querySelector("#saturation-range").value) / 100;
  const lightness = Number(document.querySelector("#lightness-range").value) / 100;
  const base = hexToHsl(theme.accentColorHex);
  const hue = (base.h - warmth * 18 + 360) % 360;
  const baseSat = Math.max(0, Math.min(1, base.s * saturation));
  const baseLight = Math.max(0.08, Math.min(0.88, base.l + lightness));
  const offsets = {
    complementary: [0, 180, 180, 0, 180, 0],
    analogous: [0, 30, -30, 0, 180, -12],
    triadic: [0, 120, -120, 0, 180, 120],
    split: [0, 150, -150, 0, 180, 30],
    tetradic: [0, 90, 180, 270, 180, 90],
    monochromatic: [0, 0, 0, 0, 0, 0],
  }[document.querySelector("#harmony-rule").value];
  const roles = ["accentColorHex", "secondaryColorHex", "backlightColorHex", "backgroundColorHex", "needleColorHex", "surfaceColorHex"];
  const palette = {};
  roles.forEach((role, index) => {
    const original = hexToHsl(theme[role] || theme.accentColorHex);
    const isPrimary = index === 0;
    const roleSaturation = isPrimary ? baseSat : Math.max(0, Math.min(1, original.s * saturation));
    let roleLight = Math.max(0.04, Math.min(0.94, original.l + lightness));
    if (index === 1 || index === 2 || index === 4) roleLight = Math.max(0.2, Math.min(0.88, baseLight + (index === 2 ? 0.16 : 0)));
    if (index === 3) roleLight = Math.max(0.015, Math.min(0.22, original.l + lightness * 0.35));
    if (index === 5) roleLight = Math.max(0.04, Math.min(0.48, original.l + lightness * 0.5));
    palette[role] = hslToHex(hue + offsets[index], roleSaturation, roleLight);
  });
  return palette;
}

function renderHarmony() {
  const labels = [
    ["accentColorHex", "Destaque"],
    ["backgroundColorHex", "Chassi"],
    ["surfaceColorHex", "Superfície"],
    ["secondaryColorHex", "Secundário"],
    ["needleColorHex", "Ponteiro"],
    ["backlightColorHex", "Lâmpada"],
  ];
  const palette = harmonyPalette();
  const container = document.querySelector("#harmony-swatches");
  container.replaceChildren();
  for (const [key, label] of labels) {
    const swatch = document.createElement("div");
    swatch.className = "harmony-swatch";
    const color = document.createElement("i");
    color.style.background = `#${palette[key]}`;
    const caption = document.createElement("span");
    caption.textContent = `${label} · #${palette[key]}`;
    swatch.append(color, caption);
    container.append(swatch);
  }
  document.querySelector("#warmth-output").textContent = `${Number(document.querySelector("#warmth-range").value) > 0 ? "+" : ""}${document.querySelector("#warmth-range").value}%`;
  document.querySelector("#saturation-output").textContent = `${document.querySelector("#saturation-range").value}%`;
  document.querySelector("#lightness-output").textContent = `${Number(document.querySelector("#lightness-range").value) > 0 ? "+" : ""}${document.querySelector("#lightness-range").value}%`;
}

function relativeLuminance(hex) {
  const channels = [0, 2, 4].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255);
  const linear = channels.map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}

function contrastRatio(first, second) {
  const a = relativeLuminance(first);
  const b = relativeLuminance(second);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

function adjustContrast(foreground, background, target = 4.5) {
  if (contrastRatio(foreground, background) >= target) return foreground;
  const original = hexToHsl(foreground);
  let best = foreground;
  let bestDelta = Infinity;
  for (let step = 1; step <= 100; step += 1) {
    for (const direction of [-1, 1]) {
      const lightness = Math.max(0, Math.min(1, original.l + direction * step / 100));
      const candidate = hslToHex(original.h, original.s, lightness);
      if (contrastRatio(candidate, background) >= target && step < bestDelta) {
        best = candidate;
        bestDelta = step;
      }
    }
    if (bestDelta !== Infinity) break;
  }
  return best;
}

function auditTheme(theme = selectedTheme()) {
  const checks = [];
  let score = 100;
  const add = (title, detail, status, deduction = 0) => {
    checks.push({ title, detail, status });
    score -= deduction;
  };
  if (/^[a-z0-9_]{1,80}$/.test(theme.id)) add("Identificador válido", "Formato compatível com o catálogo Airu.", "success");
  else add("Identificador fora do padrão", "Use letras minúsculas, números e underscore.", "warning", 10);
  if (theme.name.trim().length >= 3) add("Nome expressivo", "O nome tem pelo menos 3 caracteres.", "success");
  else add("Nome demasiado curto", "Use pelo menos 3 caracteres.", "error", 20);
  if (theme.author.trim() && theme.eraTag.trim()) add("Metadados completos", `Autor: ${theme.author} · Época: ${theme.eraTag}.`, "success");
  else add("Metadados incompletos", "Preencha o autor e a época para a catalogação.", "warning", 10);
  const needle = contrastRatio(theme.needleColorHex, theme.surfaceColorHex);
  if (needle >= 3) add("Contraste do ponteiro", `Rácio ${needle.toFixed(1)}:1; conforme para elementos gráficos WCAG AA.`, "success");
  else add("Baixo contraste do ponteiro", `Rácio ${needle.toFixed(1)}:1; mínimo recomendado: 3:1.`, "warning", 15);
  const accent = contrastRatio(theme.accentColorHex, theme.backgroundColorHex);
  if (accent >= 4.5) add("Legibilidade do destaque", `Rácio ${accent.toFixed(1)}:1; conforme WCAG AA.`, "success");
  else add("Baixa legibilidade do destaque", `Rácio ${accent.toFixed(1)}:1; recomendado: 4,5:1.`, "warning", 10);
  if (themes.filter((item) => item.id === theme.id).length === 1) add("ID único na biblioteca", "Não há outro tema local com este identificador.", "success");
  else add("ID duplicado", "Altere o identificador antes de exportar.", "error", 25);
  score = Math.max(0, Math.min(100, score));
  return { checks, score };
}

function renderAudit() {
  const { checks, score } = auditTheme();
  document.querySelector("#audit-score").textContent = `${score}%`;
  document.querySelector("#audit-label").textContent = score >= 95 ? "Excelente · pronto para lançamento" : score >= 80 ? "Bom · pequenos ajustes recomendados" : "Atenção · corrija os alertas";
  document.querySelector("#audit-score").style.color = score >= 95 ? "#73d69a" : score >= 80 ? "#f4c66d" : "#ff9696";
  const listElement = document.querySelector("#audit-results");
  listElement.replaceChildren();
  for (const check of checks) {
    const item = document.createElement("li");
    item.dataset.status = check.status;
    const title = document.createElement("strong");
    title.textContent = check.title;
    const detail = document.createElement("span");
    detail.textContent = check.detail;
    item.append(title, detail);
    listElement.append(item);
  }
}

function loadSnapshots() {
  try {
    const data = JSON.parse(localStorage.getItem(SNAPSHOT_STORAGE_KEY) || "{}");
    if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("O histórico local tem um formato inválido.");
    return data;
  } catch (error) {
    console.error("Falha ao carregar snapshots:", error);
    return {};
  }
}

function renderSnapshots() {
  const snapshots = loadSnapshots()[selectedId] || [];
  const container = document.querySelector("#snapshot-list");
  container.replaceChildren();
  if (snapshots.length === 0) {
    const empty = document.createElement("li");
    empty.textContent = "Ainda não guardou snapshots para este tema.";
    empty.className = "empty-list";
    container.append(empty);
    return;
  }
  for (const snapshot of snapshots) {
    const item = document.createElement("li");
    const info = document.createElement("span");
    info.className = "snapshot-info";
    const label = document.createElement("strong");
    label.textContent = snapshot.label;
    const date = document.createElement("small");
    date.textContent = new Intl.DateTimeFormat("pt-PT", { dateStyle: "short", timeStyle: "short" }).format(new Date(snapshot.timestamp));
    info.append(label, date);
    const restore = document.createElement("button");
    restore.type = "button";
    restore.textContent = "Restaurar";
    restore.addEventListener("click", () => {
      const restored = validateTheme(snapshot.theme);
      restored.id = selectedId;
      themes = themes.map((theme) => theme.id === selectedId ? restored : theme);
      if (!saveThemes()) return;
      render();
      renderSnapshots();
      setToolMessage("Snapshot restaurado.");
    });
    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "Eliminar";
    remove.addEventListener("click", () => {
      const allSnapshots = loadSnapshots();
      allSnapshots[selectedId] = (allSnapshots[selectedId] || []).filter((entry) => entry.id !== snapshot.id);
      try {
        localStorage.setItem(SNAPSHOT_STORAGE_KEY, JSON.stringify(allSnapshots));
      } catch (error) {
        setToolMessage(`Não foi possível eliminar o snapshot: ${error.message}`, true);
        console.error("Falha ao eliminar snapshot:", error);
        return;
      }
      renderSnapshots();
      setToolMessage("Snapshot eliminado.");
    });
    const actions = document.createElement("span");
    actions.className = "snapshot-actions";
    actions.append(restore, remove);
    item.append(info, actions);
    container.append(item);
  }
}

function renderCompare() {
  const select = document.querySelector("#compare-select");
  const previous = select.value;
  select.replaceChildren();
  const references = themes.filter((theme) => theme.id !== selectedId);
  for (const theme of references) {
    const option = document.createElement("option");
    option.value = theme.id;
    option.textContent = theme.name;
    select.append(option);
  }
  if (references.some((theme) => theme.id === previous)) select.value = previous;
  const reference = references.find((theme) => theme.id === select.value);
  renderCompareCard(document.querySelector("#compare-current"), selectedTheme());
  renderCompareCard(document.querySelector("#compare-reference"), reference);
}

function renderCompareCard(target, theme) {
  target.replaceChildren();
  if (!theme) {
    target.textContent = "Crie ou importe outro tema para comparar.";
    return;
  }
  const clone = document.querySelector("#receiver").cloneNode(true);
  clone.removeAttribute("id");
  clone.querySelectorAll("[id]").forEach((element) => element.removeAttribute("id"));
  clone.querySelector(".receiver-brand").firstChild.textContent = theme.name.toLocaleUpperCase("pt");
  clone.querySelector(".receiver-caption span").textContent = theme.eraTag;
  for (const [property, field] of [["--chassis", "backgroundColorHex"], ["--surface", "surfaceColorHex"], ["--accent", "accentColorHex"], ["--secondary", "secondaryColorHex"], ["--needle", "needleColorHex"], ["--backlight", "backlightColorHex"]]) {
    clone.style.setProperty(property, `#${theme[field]}`);
  }
  target.append(clone);
}

function generatedWebCode() {
  const theme = selectedTheme();
  const colors = {
    bg: theme.backgroundColorHex,
    surface: theme.surfaceColorHex,
    accent: theme.accentColorHex,
    secondary: theme.secondaryColorHex,
    needle: theme.needleColorHex,
    backlight: theme.backlightColorHex,
  };
  const format = document.querySelector("#web-format").value;
  if (format === "manifest") return JSON.stringify({ id: theme.id, name: theme.name, author: theme.author, version: theme.version, descriptionText: theme.descriptionText, eraTag: theme.eraTag, category: theme.category, baseLayoutRaw: theme.baseLayoutRaw, accentColorHex: theme.accentColorHex, backgroundColorHex: theme.backgroundColorHex, surfaceColorHex: theme.surfaceColorHex, secondaryColorHex: theme.secondaryColorHex, needleColorHex: theme.needleColorHex, backlightColorHex: theme.backlightColorHex, isOfficial: theme.isOfficial ?? false }, null, 2);
  if (format === "tailwind") return `module.exports = {\n  theme: {\n    extend: {\n      colors: {\n        airu: ${JSON.stringify(colors, null, 10).replaceAll('"', "'")}\n      }\n    }\n  }\n};`;
  return `:root {\n${Object.entries(colors).map(([key, value]) => `  --airu-${key}: #${value};`).join("\n")}\n  --airu-glow: 0 0 24px #${theme.accentColorHex}66;\n  --airu-meter-gradient: linear-gradient(180deg, #${theme.surfaceColorHex}, #${theme.backgroundColorHex});\n}`;
}

function renderWebCode() {
  document.querySelector("#web-code").value = generatedWebCode();
}

function renderShowcase() {
  const theme = selectedTheme();
  const preview = document.querySelector("#showcase-preview");
  preview.style.background = `radial-gradient(ellipse at 80% 20%, #${theme.surfaceColorHex}, #${theme.backgroundColorHex} 74%)`;
  preview.replaceChildren();
  const title = document.createElement("strong");
  title.textContent = theme.name;
  title.style.color = `#${theme.accentColorHex}`;
  const description = document.createElement("small");
  description.textContent = `${theme.eraTag} · ${theme.baseLayoutRaw} · ${theme.author}`;
  const swatches = document.createElement("span");
  swatches.className = "showcase-swatches";
  for (const key of ["backgroundColorHex", "surfaceColorHex", "accentColorHex", "needleColorHex", "backlightColorHex"]) {
    const swatch = document.createElement("i");
    swatch.style.backgroundColor = `#${theme[key]}`;
    swatches.append(swatch);
  }
  preview.append(title, description, swatches);
}

function renderActiveTool() {
  const active = document.querySelector(".studio-tool-panel:not([hidden])")?.dataset.toolPanel;
  if (active === "harmony") renderHarmony();
  if (active === "audit") renderAudit();
  if (active === "snapshots") renderSnapshots();
  if (active === "compare") renderCompare();
  if (active === "web") renderWebCode();
  if (active === "showcase") renderShowcase();
}

function setToolMessage(text, isError = false) {
  const status = document.querySelector("#tool-message");
  status.textContent = text;
  status.style.color = isError ? "#ff9696" : "#8ed3a4";
}

function openTool(name) {
  document.querySelectorAll("[data-tool-tab]").forEach((tab) => {
    const selected = tab.dataset.toolTab === name;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
  document.querySelectorAll("[data-tool-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.toolPanel !== name;
  });
  document.querySelector("#tool-message").textContent = "";
  renderActiveTool();
  const dialog = document.querySelector("#studio-dialog");
  if (!dialog.open) dialog.showModal();
}

function applyPhotoPalette(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 64;
        canvas.height = 64;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context) throw new Error("O navegador não disponibilizou o canvas para análise.");
        context.drawImage(image, 0, 0, 64, 64);
        const { data } = context.getImageData(0, 0, 64, 64);
        const bins = new Map();
        for (let index = 0; index < data.length; index += 4) {
          const r = data[index], g = data[index + 1], b = data[index + 2];
          const key = `${r >> 3},${g >> 3},${b >> 3}`;
          const bin = bins.get(key) || { r: 0, g: 0, b: 0, count: 0 };
          bin.r += r; bin.g += g; bin.b += b; bin.count += 1;
          bins.set(key, bin);
        }
        const colors = [...bins.values()].map((bin) => {
          const r = bin.r / bin.count / 255, g = bin.g / bin.count / 255, b = bin.b / bin.count / 255;
          const max = Math.max(r, g, b), min = Math.min(r, g, b);
          return { r, g, b, count: bin.count, lum: r * .299 + g * .587 + b * .114, sat: max === 0 ? 0 : (max - min) / max, hex: [bin.r, bin.g, bin.b].map((sum) => Math.round(sum / bin.count).toString(16).padStart(2, "0")).join("") };
        });
        const mostFrequent = (predicate, fallback) => colors.filter(predicate).sort((a, b) => b.count - a.count)[0]?.hex || fallback;
        const saturated = [...colors].sort((a, b) => (b.sat * b.lum * Math.log1p(b.count)) - (a.sat * a.lum * Math.log1p(a.count)));
        const accent = saturated.find((color) => color.lum > .22 && color.sat > .3)?.hex || selectedTheme().accentColorHex;
        const palette = {
          backgroundColorHex: mostFrequent((color) => color.lum < .22, selectedTheme().backgroundColorHex),
          surfaceColorHex: mostFrequent((color) => color.lum >= .10 && color.lum < .48, selectedTheme().surfaceColorHex),
          accentColorHex: accent,
          needleColorHex: mostFrequent((color) => color.r > color.g * 1.35 && color.r > color.b * 1.35 && color.lum > .15, selectedTheme().needleColorHex),
          backlightColorHex: mostFrequent((color) => color.lum > .48 && color.sat > .16, selectedTheme().backlightColorHex),
          secondaryColorHex: saturated.find((color) => color.hex !== accent && color.lum > .25)?.hex || accent,
        };
        resolve({ palette, previewUrl: objectUrl });
      } catch (error) {
        URL.revokeObjectURL(objectUrl);
        reject(error);
      }
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Não foi possível abrir a imagem escolhida."));
    };
    image.src = objectUrl;
  });
}

form.addEventListener("input", updateSelectedTheme);
form.addEventListener("change", updateSelectedTheme);
document.querySelector("#search-input").addEventListener("input", renderList);
document.querySelector("#new-button").addEventListener("click", () => createTheme());
document.querySelector("#duplicate-button").addEventListener("click", () => createTheme(selectedTheme(), true));
document.querySelector("#export-button").addEventListener("click", () => downloadTheme(selectedTheme()));
document.querySelector("#delete-button").addEventListener("click", () => {
  if (themes.length < 2) return;
  const theme = selectedTheme();
  if (!window.confirm(`Eliminar o tema “${theme.name}” deste navegador?`)) return;
  themes = themes.filter((item) => item.id !== selectedId);
  selectedId = themes[0].id;
  if (!saveThemes()) {
    render();
    return;
  }
  render();
  showMessage("Tema eliminado.");
});

document.querySelectorAll("[data-preset]").forEach((button) => {
  button.addEventListener("click", () => {
    const theme = selectedTheme();
    Object.assign(theme, palettes[button.dataset.preset]);
    if (!saveThemes()) return;
    render();
    showMessage("Paleta aplicada.");
  });
});

document.querySelector("#import-button").addEventListener("click", () => document.querySelector("#import-input").click());
document.querySelector("#import-input").addEventListener("change", async (event) => {
  const [file] = event.target.files;
  if (!file) return;
  try {
    const imported = validateTheme(JSON.parse(await file.text()));
    if (themes.some((theme) => theme.id === imported.id)) throw new Error(`Já existe um tema com o identificador “${imported.id}”.`);
    themes.unshift(imported);
    selectedId = imported.id;
    if (!saveThemes()) return;
    render();
    showMessage("Tema importado com sucesso.");
  } catch (error) {
    showMessage(`Não foi possível importar: ${error.message}`, true);
  } finally {
    event.target.value = "";
  }
});

document.querySelector("#test-link-button").addEventListener("click", () => {
  const theme = selectedTheme();
  window.location.href = `airu://theme?id=${encodeURIComponent(theme.id)}`;
});

document.querySelectorAll("[data-open-tool]").forEach((button) => button.addEventListener("click", () => openTool(button.dataset.openTool)));
document.querySelectorAll("[data-tool-tab]").forEach((tab) => tab.addEventListener("click", () => openTool(tab.dataset.toolTab)));
document.querySelector("#close-studio-dialog").addEventListener("click", () => document.querySelector("#studio-dialog").close());
document.querySelector("#studio-dialog").addEventListener("click", (event) => {
  if (event.target === event.currentTarget) event.currentTarget.close();
});
["#harmony-rule", "#warmth-range", "#saturation-range", "#lightness-range"].forEach((selector) => {
  document.querySelector(selector).addEventListener("input", renderHarmony);
});
document.querySelector("#apply-harmony").addEventListener("click", () => {
  Object.assign(selectedTheme(), harmonyPalette());
  if (!saveThemes()) return;
  render();
  renderHarmony();
  setToolMessage("Paleta harmonizada aplicada ao tema.");
});
let extractedPhotoPalette = null;
document.querySelector("#photo-input").addEventListener("change", async (event) => {
  const [file] = event.target.files;
  if (!file) return;
  try {
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) throw new Error("Escolha um ficheiro PNG, JPEG ou WebP.");
    if (file.size > 20 * 1024 * 1024) throw new Error("A imagem deve ter menos de 20 MB.");
    const result = await applyPhotoPalette(file);
    const preview = document.querySelector("#photo-preview");
    if (preview.dataset.objectUrl) URL.revokeObjectURL(preview.dataset.objectUrl);
    preview.src = result.previewUrl;
    preview.dataset.objectUrl = result.previewUrl;
    preview.hidden = false;
    extractedPhotoPalette = result.palette;
    const container = document.querySelector("#photo-swatches");
    container.replaceChildren();
    for (const [key, label] of [["backgroundColorHex", "Chassi"], ["surfaceColorHex", "Superfície"], ["accentColorHex", "Destaque"], ["needleColorHex", "Ponteiro"], ["backlightColorHex", "Visor"], ["secondaryColorHex", "Secundário"]]) {
      const swatch = document.createElement("div");
      swatch.className = "harmony-swatch";
      const color = document.createElement("i");
      color.style.background = `#${result.palette[key]}`;
      const caption = document.createElement("span");
      caption.textContent = `${label} · #${result.palette[key]}`;
      swatch.append(color, caption);
      container.append(swatch);
    }
    document.querySelector("#apply-photo-palette").disabled = false;
    setToolMessage("Paleta extraída da imagem. Reveja as amostras antes de aplicar.");
  } catch (error) {
    setToolMessage(error.message, true);
  } finally {
    event.target.value = "";
  }
});
document.querySelector("#apply-photo-palette").addEventListener("click", () => {
  if (!extractedPhotoPalette) return;
  Object.assign(selectedTheme(), extractedPhotoPalette);
  if (!saveThemes()) return;
  render();
  setToolMessage("Paleta da fotografia aplicada ao tema.");
});
document.querySelector("#auto-fix-button").addEventListener("click", () => {
  const theme = selectedTheme();
  theme.id = theme.id.toLowerCase().replace(/-/g, "_").replace(/[^a-z0-9_]/g, "") || `tema_${Date.now()}`;
  if (themes.some((item) => item !== theme && item.id === theme.id)) theme.id = `${theme.id}_${Date.now()}`;
  theme.name = theme.name.trim().length >= 3 ? theme.name.trim() : "Tema Hi-Fi";
  theme.author = theme.author.trim() || "InfoReis Audiophile Lab";
  theme.eraTag = theme.eraTag.trim() || "1970s";
  theme.needleColorHex = adjustContrast(theme.needleColorHex, theme.surfaceColorHex);
  theme.accentColorHex = adjustContrast(theme.accentColorHex, theme.backgroundColorHex);
  selectedId = theme.id;
  if (!saveThemes()) return;
  render();
  renderAudit();
  setToolMessage("Metadados e contrastes corrigidos quando necessário.");
});
document.querySelector("#save-snapshot").addEventListener("click", () => {
  const snapshots = loadSnapshots();
  const current = snapshots[selectedId] || [];
  current.unshift({ id: crypto.randomUUID(), label: document.querySelector("#snapshot-label").value.trim() || selectedTheme().name, timestamp: new Date().toISOString(), theme: { ...selectedTheme() } });
  snapshots[selectedId] = current;
  try {
    localStorage.setItem(SNAPSHOT_STORAGE_KEY, JSON.stringify(snapshots));
  } catch (error) {
    setToolMessage(`Não foi possível guardar o snapshot: ${error.message}`, true);
    return;
  }
  document.querySelector("#snapshot-label").value = "";
  renderSnapshots();
  setToolMessage("Snapshot guardado.");
});
document.querySelector("#compare-select").addEventListener("change", renderCompare);
document.querySelector("#web-format").addEventListener("change", renderWebCode);
document.querySelector("#copy-web-code").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(generatedWebCode());
    setToolMessage("Código copiado para a área de transferência.");
  } catch (error) {
    const code = document.querySelector("#web-code");
    code.focus();
    code.select();
    setToolMessage("O navegador bloqueou a cópia. O código está selecionado para copiar manualmente.", true);
    console.error("Falha ao copiar código gerado:", error);
  }
});
document.querySelector("#download-web-code").addEventListener("click", () => {
  const format = document.querySelector("#web-format").value;
  const extension = format === "css" ? "css" : format === "tailwind" ? "js" : "json";
  const mime = format === "css" ? "text/css" : format === "tailwind" ? "text/javascript" : "application/json";
  downloadFile(generatedWebCode(), `${selectedTheme().id}.${extension}`, mime);
});
document.querySelector("#download-showcase").addEventListener("click", () => {
  const theme = selectedTheme();
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 750;
  const context = canvas.getContext("2d");
  if (!context) {
    setToolMessage("O navegador não disponibilizou o canvas para exportar a imagem.", true);
    return;
  }
  const gradient = context.createLinearGradient(0, 0, 1200, 750);
  gradient.addColorStop(0, `#${theme.surfaceColorHex}`);
  gradient.addColorStop(.58, `#${theme.backgroundColorHex}`);
  gradient.addColorStop(1, "#07090d");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 1200, 750);
  context.fillStyle = `#${theme.accentColorHex}`;
  context.font = "700 18px monospace";
  context.fillText("AIRU AUDIOPHILE SKIN SPECIFICATION", 60, 72);
  context.fillStyle = "#f3eee2";
  context.font = "700 54px sans-serif";
  context.fillText(theme.name.slice(0, 28), 60, 145);
  context.fillStyle = `#${theme.backlightColorHex}`;
  context.font = "500 40px monospace";
  context.fillText("FM 97.4 MHz", 60, 245);
  context.strokeStyle = "#ffffff38";
  context.lineWidth = 2;
  for (let index = 0; index < 2; index += 1) {
    const x = 72 + index * 400;
    context.fillStyle = `#${theme.surfaceColorHex}`;
    context.fillRect(x, 305, 350, 190);
    context.strokeRect(x, 305, 350, 190);
    context.fillStyle = `#${theme.backlightColorHex}30`;
    context.fillRect(x + 18, 325, 314, 145);
    context.strokeStyle = `#${theme.backlightColorHex}`;
    context.beginPath();
    context.arc(x + 175, 470, 128, Math.PI, Math.PI * 2);
    context.stroke();
    context.strokeStyle = `#${theme.needleColorHex}`;
    context.lineWidth = 5;
    context.beginPath();
    context.moveTo(x + 175, 470);
    context.lineTo(x + 217, 367 + index * 13);
    context.stroke();
    context.fillStyle = "#d8d3c5";
    context.font = "14px monospace";
    context.fillText(index === 0 ? "LEFT CHANNEL" : "RIGHT CHANNEL", x + 18, 520);
    context.lineWidth = 2;
    context.strokeStyle = "#ffffff38";
  }
  context.fillStyle = "#c3c7d0";
  context.font = "18px sans-serif";
  context.fillText(theme.descriptionText.slice(0, 100), 60, 585);
  const swatches = ["backgroundColorHex", "surfaceColorHex", "accentColorHex", "needleColorHex", "backlightColorHex"];
  swatches.forEach((key, index) => {
    context.fillStyle = `#${theme[key]}`;
    context.beginPath();
    context.arc(795 + index * 64, 650, 20, 0, Math.PI * 2);
    context.fill();
  });
  context.fillStyle = "#9096a3";
  context.font = "14px monospace";
  context.fillText(`${theme.eraTag} · ${theme.baseLayoutRaw} · ${theme.author}`, 60, 680);
  canvas.toBlob((blob) => {
    if (!blob) {
      setToolMessage("Não foi possível criar o PNG.", true);
      return;
    }
    downloadBlob(blob, `${theme.id}_showcase.png`);
    setToolMessage("Imagem Showcase 1200 × 750 exportada.");
  }, "image/png");
});

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function downloadFile(content, filename, mime) {
  downloadBlob(new Blob([content], { type: `${mime};charset=utf-8` }), filename);
  setToolMessage(`${filename} exportado.`);
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  document.querySelector("#install-button").hidden = false;
});
document.querySelector("#install-button").addEventListener("click", async () => {
  if (!deferredInstallPrompt) return;
  await deferredInstallPrompt.prompt();
  deferredInstallPrompt = null;
  document.querySelector("#install-button").hidden = true;
});
window.addEventListener("appinstalled", () => {
  document.querySelector("#install-button").hidden = true;
});

render();
if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1")) {
  navigator.serviceWorker.register("./service-worker.js").catch((error) => {
    showMessage(`Não foi possível ativar o modo offline: ${error.message}`, true);
    console.error("Falha ao registar service worker:", error);
  });
}
