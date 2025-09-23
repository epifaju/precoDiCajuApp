// Script Node.js pour générer un hash BCrypt valide
const bcrypt = require("bcrypt");

const password = "admin123";
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error("Erreur:", err);
  } else {
    console.log("Mot de passe:", password);
    console.log("Hash BCrypt:", hash);
    console.log("Longueur du hash:", hash.length);
    console.log("");
    console.log("Commande SQL pour mettre à jour:");
    console.log(
      `UPDATE users SET password_hash = '${hash}' WHERE email = 'admin@precaju.gw';`
    );
  }
});
