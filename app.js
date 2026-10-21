// Shared helpers, storage, header and bottom nav. Load AFTER data.js.
const $ = (s) => document.querySelector(s);
const S = {
  get(k, d) { try { const v = localStorage.getItem("bs_" + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem("bs_" + k, JSON.stringify(v)); } catch (e) {} },
};
const ALLERGENS = ["Peanuts", "Shellfish", "Soy", "Wheat", "Egg", "Milk", "Fish"];
const userName = () => { try { return localStorage.getItem("buffetsense_name") || ""; } catch (e) { return ""; } };
const dish = (id) => DISHES.find((d) => d.id === id);
const profile = () => Object.assign({ allergens: [], goal: 700 }, S.get("profile", {}));
const conflicts = (d) => d.al.filter((a) => profile().allergens.includes(a));
const plate = () => S.get("plate", {});
const plateCount = () => Object.values(plate()).reduce((a, b) => a + b, 0);
const plateKcal = () => Object.entries(plate()).reduce((s, [id, q]) => s + (dish(id) ? dish(id).kcal * q : 0), 0);
const favs = () => S.get("fav", []);
const reviews = () => S.get("reviews", []);
const stars = (n) => "★".repeat(n) + "☆".repeat(5 - n);
const avg = (l) => (l.length ? l.reduce((s, r) => s + r.rating, 0) / l.length : 0);

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}
function toggleFav(id) {
  const f = favs(); const i = f.indexOf(id);
  i < 0 ? f.push(id) : f.splice(i, 1);
  S.set("fav", f);
  return i < 0;
}
function addToPlate(id, delta = 1) {
  const p = plate(); p[id] = (p[id] || 0) + delta;
  if (p[id] <= 0) delete p[id];
  S.set("plate", p); updateBadge();
}
function toast(m) {
  let t = $("#toast");
  if (!t) { t = el("div", "toast"); t.id = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
  t.textContent = m; t.hidden = false;
  clearTimeout(t._t); t._t = setTimeout(() => (t.hidden = true), 2200);
}
function iconBtn(icon, label, onClick) {
  const b = el("button", "icon-btn"); b.type = "button";
  b.setAttribute("aria-label", label);
  b.innerHTML = `<i class="${icon}"></i>`;
  b.addEventListener("click", onClick);
  return b;
}
function reviewCard(r, onDelete) {
  const c = el("article", "review");
  const who = el("div", "who"); who.append(el("span", "", r.name), el("span", "stars-readout", stars(r.rating)));
  const meta = el("div", "meta");
  const d = dish(r.dish);
  meta.append(el("span", "", (d ? d.n : "General") + " · " + new Date(r.ts).toLocaleDateString()));
  if (onDelete) meta.append(iconBtn("fas fa-trash", "Delete review", () => onDelete(r.id)));
  c.append(who, el("p", "", r.text), meta);
  return c;
}
function updateBadge() {
  const d = $("#plateDot"); if (!d) return;
  const n = plateCount(); d.textContent = n; d.hidden = !n;
}

(function shell() {
  const tabs = [
    ["dashboard.html", "fa-house", "Home", "home"],
    ["menu.html", "fa-qrcode", "Scan", "scan"],
    ["fmenu.html", "fa-utensils", "Menu", "menu"],
    ["plate.html", "fa-bowl-food", "Plate", "plate"],
    ["feedback.html", "fa-comment-dots", "Reviews", "feedback"],
  ];
  const { page, back } = document.body.dataset;
  const root = $(".app"); if (!root) return;
  const left = back ? `<a class="icon-btn" href="${back}" aria-label="Back"><i class="fas fa-arrow-left"></i></a>` : "<span></span>";
  root.insertAdjacentHTML("afterbegin",
    `<header class="app-header">${left}
      <a class="brand-link" href="dashboard.html"><img src="buffetsense-logo.png" alt="BuffetSense home"></a>
      <a class="icon-btn" href="profile.html" aria-label="Profile and settings"><i class="fas fa-user-gear"></i></a>
    </header>`);
  root.insertAdjacentHTML("beforeend",
    `<nav class="bottom-nav" aria-label="Main">${tabs.map(([h, i, l, k]) =>
      `<a href="${h}"${k === page ? ' aria-current="page"' : ""}><i class="fas ${i}"></i>${l}${k === "plate" ? '<span class="dot" id="plateDot" hidden></span>' : ""}</a>`).join("")}</nav>`);
  updateBadge();
})();
