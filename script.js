/* =========================================================
   GOOGLE FORMA – PODEŠAVANJE
   1. Napravite Google Formu sa 4 pitanja (Kratak odgovor / Pasus):
      Ime i prezime, Email, Broj telefona, Poruka / pitanje
   2. U formi: ⋮ → "Get pre-filled link", upišite bilo šta u sva polja,
      kliknite "Get link" i kopirajte ga.
   3. Iz linka prepišite ID forme (deo posle /d/e/) i brojeve entry.XXXX
      za svako polje u objekat ispod.
   Dok ovo nije popunjeno, forma otvara email poruku kao rezervnu opciju.
   ========================================================= */
const FORM_CONFIG = {
  formId: "",            // npr. "1FAIpQLSc...."
  fields: {
    ime: "",             // npr. "entry.123456789"
    email: "",
    telefon: "",
    poruka: ""
  }
};
const FALLBACK_EMAIL = "vendingaparati018@gmail.com";

/* ---------------- Tabovi ---------------- */
const TABS = ["pocetna", "o-nama", "kafe-aparati", "vending-aparati", "kontakt"];
const panels = document.querySelectorAll(".panel");
const tabLinks = document.querySelectorAll(".tabs a[data-tab]");

function showTab(id, scrollTarget) {
  if (!TABS.includes(id)) id = "pocetna";
  panels.forEach(p => { p.hidden = p.id !== id; });
  tabLinks.forEach(a => a.setAttribute("aria-selected", String(a.dataset.tab === id)));
  const target = scrollTarget && document.getElementById(scrollTarget);
  if (target) {
    requestAnimationFrame(() => target.scrollIntoView({ behavior: "smooth", block: "start" }));
  } else {
    window.scrollTo({ top: 0, behavior: "instant" });
  }
}

function route() {
  const hash = decodeURIComponent(location.hash.slice(1));
  if (hash === "upit") return showTab("pocetna", "upit");
  showTab(hash || "pocetna");
}
window.addEventListener("hashchange", route);
route();

/* ---------------- Upitnik ---------------- */
const form = document.getElementById("inquiry-form");
const statusEl = document.getElementById("form-status");
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function setStatus(msg, kind) {
  statusEl.textContent = msg;
  statusEl.className = "form-status" + (kind ? " " + kind : "");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  let ok = true;
  form.querySelectorAll(".field").forEach(f => f.classList.remove("invalid"));
  for (const [k, v] of Object.entries(data)) {
    const bad = !v.trim() || (k === "email" && !emailRe.test(v.trim()));
    if (bad) { ok = false; form.querySelector(`[name="${k}"]`).closest(".field").classList.add("invalid"); }
  }
  if (!ok) return setStatus("Molimo popunite sva polja ispravno.", "err");

  const configured = FORM_CONFIG.formId && Object.values(FORM_CONFIG.fields).every(Boolean);

  if (!configured) {
    const body = `Ime: ${data.ime}\nEmail: ${data.email}\nTelefon: ${data.telefon}\n\n${data.poruka}`;
    location.href = `mailto:${FALLBACK_EMAIL}?subject=${encodeURIComponent("Upit sa sajta – " + data.ime)}&body=${encodeURIComponent(body)}`;
    return setStatus("Otvaramo vaš email program da pošaljete upit.", "ok");
  }

  const params = new URLSearchParams();
  for (const [k, entry] of Object.entries(FORM_CONFIG.fields)) params.append(entry, data[k].trim());

  const btn = form.querySelector("button");
  btn.disabled = true;
  setStatus("Šaljemo...", "");
  try {
    await fetch(`https://docs.google.com/forms/d/e/${FORM_CONFIG.formId}/formResponse`, {
      method: "POST", mode: "no-cors", body: params
    });
    form.reset();
    setStatus("Hvala! Vaš upit je poslat — javićemo vam se uskoro.", "ok");
  } catch {
    setStatus(`Slanje nije uspelo. Pozovite nas na 061/118-1580 ili pišite na ${FALLBACK_EMAIL}.`, "err");
  } finally {
    btn.disabled = false;
  }
});

document.getElementById("year").textContent = new Date().getFullYear();
