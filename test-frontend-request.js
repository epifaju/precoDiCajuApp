// Script de test pour diagnostiquer la requête de login depuis le frontend
console.log("=== Test de la requête de login depuis le frontend ===");

// Test 1: Requête avec fetch
async function testLoginWithFetch() {
  console.log("\n1. Test avec fetch:");

  const loginData = {
    email: "test@example.com",
    password: "password123",
    rememberMe: false,
  };

  console.log("Données envoyées:", loginData);

  try {
    const response = await fetch("http://localhost:8080/api/v1/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(loginData),
    });

    console.log("Status:", response.status);
    console.log("Status Text:", response.statusText);
    console.log("Headers:", Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Succès:", data);
    } else {
      const errorData = await response.text();
      console.log("❌ Erreur HTTP", response.status, ":", errorData);
    }
  } catch (error) {
    console.error("❌ Erreur réseau:", error);
  }
}

// Test 2: Requête avec XMLHttpRequest
function testLoginWithXHR() {
  console.log("\n2. Test avec XMLHttpRequest:");

  const loginData = {
    email: "test@example.com",
    password: "password123",
    rememberMe: false,
  };

  console.log("Données envoyées:", loginData);

  const xhr = new XMLHttpRequest();
  xhr.open("POST", "http://localhost:8080/api/v1/auth/login", true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("Accept", "application/json");

  xhr.onload = function () {
    console.log("Status:", xhr.status);
    console.log("Status Text:", xhr.statusText);
    console.log("Response Headers:", xhr.getAllResponseHeaders());

    if (xhr.status >= 200 && xhr.status < 300) {
      console.log("✅ Succès:", xhr.responseText);
    } else {
      console.log("❌ Erreur HTTP", xhr.status, ":", xhr.responseText);
    }
  };

  xhr.onerror = function () {
    console.error("❌ Erreur réseau XHR");
  };

  xhr.send(JSON.stringify(loginData));
}

// Test 3: Test CORS preflight
async function testCorsPreflight() {
  console.log("\n3. Test CORS preflight (OPTIONS):");

  try {
    const response = await fetch("http://localhost:8080/api/v1/auth/login", {
      method: "OPTIONS",
      headers: {
        Origin: "http://localhost:3002",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type",
      },
    });

    console.log("Status OPTIONS:", response.status);
    console.log(
      "Headers OPTIONS:",
      Object.fromEntries(response.headers.entries())
    );

    if (response.ok) {
      console.log("✅ CORS preflight réussi");
    } else {
      console.log("❌ CORS preflight échoué");
    }
  } catch (error) {
    console.error("❌ Erreur CORS preflight:", error);
  }
}

// Test 4: Test avec données invalides
async function testInvalidData() {
  console.log("\n4. Test avec données invalides:");

  const invalidData = {
    email: "invalid-email",
    password: "123", // trop court
  };

  console.log("Données invalides envoyées:", invalidData);

  try {
    const response = await fetch("http://localhost:8080/api/v1/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(invalidData),
    });

    console.log("Status:", response.status);

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Succès (inattendu):", data);
    } else {
      const errorData = await response.text();
      console.log("❌ Erreur HTTP", response.status, ":", errorData);
    }
  } catch (error) {
    console.error("❌ Erreur réseau:", error);
  }
}

// Exécuter tous les tests
async function runAllTests() {
  await testLoginWithFetch();
  testLoginWithXHR();
  await testCorsPreflight();
  await testInvalidData();

  console.log("\n=== Fin des tests ===");
}

// Lancer les tests
runAllTests();
