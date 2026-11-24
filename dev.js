(() => {
  const frame = document.getElementById("appFrame");
  const status = document.getElementById("envStatus");
  const appState = document.getElementById("appState");
  const results = document.getElementById("testResults");
  let ready = false;

  function app() {
    try { return frame.contentWindow.document; } catch { return null; }
  }
  function setStatus(message, type = "") {
    status.textContent = message;
    status.className = "status " + type;
    appState.textContent = ready ? "Application chargée" : "Chargement…";
  }
  function inspectFrame() {
    const doc = app();
    ready = !!doc && doc.readyState === "complete";
    setStatus(ready ? "Application de test chargée. Les données sont séparées de la démo publique." : "L'application intégrée n'a pas terminé son chargement. Utilise Recharger l'app.", ready ? "good" : "bad");
  }
  frame.addEventListener("load", inspectFrame);
  // Le script différé peut s'exécuter après le chargement initial de l'iframe sur mobile.
  if (frame.contentDocument && frame.contentDocument.readyState === "complete") inspectFrame();

  function report(items) {
    results.innerHTML = items.map(item =>
      '<div class="test"><span class="dot ' + (item.ok ? "ok" : "fail") + '">' + (item.ok ? "✓" : "×") +
      '</span><div><b>' + item.name + '</b><small>' + item.detail + '</small></div></div>'
    ).join("");
  }

  document.getElementById("runTests").addEventListener("click", () => {
    const d = app();
    if (!d || !ready) {
      setStatus("L'application n'est pas encore prête. Recharge-la puis réessaie.", "bad");
      return;
    }
    const checks = [];
    const check = (name, condition, detail) => checks.push({name, ok: !!condition, detail});
    const requiredIds = ["requestForm","requestName","requestBudget","requestCity","sellerView","buyerView","offersView","photoInput","confirmPhoto","skipPhoto","offersList"];
    const missing = requiredIds.filter(id => !d.getElementById(id));
    check("Structure de l'application", missing.length === 0, missing.length ? "Éléments absents : " + missing.join(", ") : "Tous les éléments essentiels sont présents.");

    try {
      const sellerTab = d.querySelector('[data-view="seller"]');
      sellerTab.click();
      const sellerVisible = d.getElementById("sellerView").classList.contains("active");
      check("Navigation vers l'espace vendeur", sellerVisible, sellerVisible ? "Le bouton Vendeur ouvre bien le bon espace." : "Le clic ne rend pas l'espace vendeur visible.");
      d.querySelector('[data-view="buyer"]').click();
    } catch (e) {
      check("Navigation vers l'espace vendeur", false, e.message);
    }

    try {
      const form = d.getElementById("requestForm");
      d.getElementById("requestName").value = "Objet de test développeur";
      d.getElementById("requestBudget").value = "125";
      d.getElementById("requestCity").value = "Sète";
      form.dispatchEvent(new frame.contentWindow.Event("submit", {bubbles:true,cancelable:true}));
      const result = d.getElementById("requestResult");
      const published = result && !result.hidden && result.textContent.includes("Recherche enregistrée");
      check("Publication d'une recherche", published, published ? "La recherche de test est enregistrée dans le stockage DEV." : "Aucune confirmation de publication n'a été détectée.");
    } catch (e) {
      check("Publication d'une recherche", false, e.message);
    }

    try {
      const offers = d.getElementById("offersList");
      const offerCards = offers.querySelectorAll(".offer-card").length;
      check("Affichage des offres de démonstration", offerCards > 0, offerCards + " proposition(s) visible(s) dans le jeu de données fictif.");
    } catch (e) {
      check("Affichage des offres de démonstration", false, e.message);
    }

    try {
      const upload = d.getElementById("photoInput");
      const controls = !!d.getElementById("confirmPhoto") && !!d.getElementById("skipPhoto");
      check("Parcours d'ajout de photos", !!upload && controls, controls ? "Sélecteur multiple et commandes de validation présents. La sélection réelle reste à tester sur appareil." : "Un ou plusieurs contrôles photo sont absents.");
    } catch (e) {
      check("Parcours d'ajout de photos", false, e.message);
    }

    const passed = checks.filter(x => x.ok).length;
    report(checks);
    setStatus(passed + " / " + checks.length + " tests réussis. Les tests sont exécutés dans l'environnement DEV.", passed === checks.length ? "good" : "bad");
  });

  document.getElementById("reloadApp").addEventListener("click", () => {
    ready = false;
    frame.src = "index.html?dev=1&build=4&refresh=" + Date.now();
    setStatus("Rechargement de l'application…");
  });

  document.getElementById("clearDev").addEventListener("click", () => {
    const w = frame.contentWindow;
    try {
      w.localStorage.removeItem("trouvobjet-dev-v1");
      ready = false;
      frame.src = "index.html?dev=1&refresh=" + Date.now();
      results.innerHTML = "";
      setStatus("Données DEV effacées. Rechargement des exemples…", "good");
    } catch (e) {
      setStatus("Impossible d'effacer les données DEV : " + e.message, "bad");
    }
  });
})();