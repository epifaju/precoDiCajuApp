// Test script pour vérifier la traduction
const i18next = require("i18next");
const Backend = require("i18next-fs-backend");

// Configuration i18next
i18next.use(Backend).init(
  {
    lng: "pt",
    fallbackLng: "en",
    backend: {
      loadPath: "./src/i18n/locales/{{lng}}.json",
    },
  },
  (err, t) => {
    if (err) {
      console.error("Erreur i18next:", err);
      return;
    }

    console.log("=== Test de traduction ===");

    try {
      // Test de la clé prices.filters
      const filtersText = t("prices.filters");
      console.log("prices.filters:", filtersText);
      console.log("Type:", typeof filtersText);

      if (typeof filtersText === "string") {
        console.log("✅ SUCCÈS: prices.filters retourne une chaîne");
      } else {
        console.log("❌ ERREUR: prices.filters retourne un objet");
        console.log("Valeur:", JSON.stringify(filtersText, null, 2));
      }

      // Test d'autres clés pour comparaison
      console.log("\n--- Autres tests ---");
      console.log("prices.title:", t("prices.title"));
      console.log("prices.clearFilters:", t("prices.clearFilters"));
    } catch (error) {
      console.error("❌ Erreur lors du test:", error.message);
    }
  }
);
