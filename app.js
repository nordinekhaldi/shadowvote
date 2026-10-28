// ShadowVote — menu mobile, boutons de partage, formulaire de contact.
(function () {
  var b = document.querySelector(".burger"), m = document.getElementById("menu");
  if (b && m) b.addEventListener("click", function () {
    var o = m.classList.toggle("ouvert"); b.setAttribute("aria-expanded", o ? "true" : "false");
  });

  // Partage : rien n'est chargé depuis les réseaux tant qu'on ne clique pas.
  var url = location.origin + location.pathname;
  var texte = "L'urne est morte ! Vive le ShadowVote ! Un livre gratuit : et si chaque électeur pouvait vérifier son vote ? Ne crois plus, vérifie.";
  var liens = {
    whatsapp: "https://wa.me/?text=" + encodeURIComponent(texte + " " + url),
    facebook: "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url),
    x: "https://twitter.com/intent/tweet?text=" + encodeURIComponent(texte) + "&url=" + encodeURIComponent(url),
    telegram: "https://t.me/share/url?url=" + encodeURIComponent(url) + "&text=" + encodeURIComponent(texte)
  };
  document.querySelectorAll("[data-reseau]").forEach(function (el) {
    var r = el.getAttribute("data-reseau");
    if (liens[r]) { el.href = liens[r]; el.target = "_blank"; el.rel = "noopener"; }
    if (r === "copier") el.addEventListener("click", function () {
      var fini = function () { el.textContent = "Lien copié ✓"; setTimeout(function () { el.textContent = "Copier le lien"; }, 2500); };
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(fini, function () { prompt("Copie ce lien :", url); });
      else prompt("Copie ce lien :", url);
    });
  });
  if (navigator.share) document.querySelectorAll(".partage-btns").forEach(function (z) {
    var btn = document.createElement("button"); btn.type = "button"; btn.className = "pbtn"; btn.textContent = "Partager…";
    btn.addEventListener("click", function () { navigator.share({ title: document.title, text: texte, url: url }).catch(function () {}); });
    z.insertBefore(btn, z.firstChild);
  });

  // Formulaire de contact
  var f = document.getElementById("form-contact");
  if (!f) return;
  var p = new URLSearchParams(location.search).get("sujet");
  if (p && f.sujet.querySelector('option[value="' + p + '"]')) f.sujet.value = p;
  var msg = f.querySelector(".form-msg");
  f.addEventListener("submit", function (e) {
    e.preventDefault();
    msg.className = "form-msg"; msg.textContent = "";
    if (f.site.value) return; // robot
    var d = { prenom: f.prenom.value.trim(), email: f.email.value.trim(), message: f.message.value.trim(), sujet: f.sujet.value };
    if (!d.prenom || !/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(d.email) || d.message.length < 2) {
      msg.className = "form-msg err"; msg.textContent = "Remplis ton prénom, un e-mail valide et ton message."; return;
    }
    if (!f.accord.checked) { msg.className = "form-msg err"; msg.textContent = "Coche la case d'accord pour qu'on puisse te répondre."; return; }
    var btn = f.querySelector("button[type=submit]"); btn.disabled = true; btn.textContent = "Envoi…";
    fetch("https://www.devisencheres.fr/api/shadowvote/contact", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d)
    }).then(function (r) {
      if (!r.ok) return r.text().then(function (t) { throw new Error(t); });
      f.reset(); msg.className = "form-msg ok";
      msg.textContent = "Message bien reçu, merci ! Je te réponds dès que possible. En attendant, tu peux déjà aider le ShadowVote : parles-en à trois personnes autour de toi.";
    }).catch(function (er) {
      msg.className = "form-msg err";
      msg.textContent = /TROP_DE/.test(String(er)) ? "Tu as envoyé beaucoup de messages. Réessaie dans une heure." : "L'envoi a échoué. Réessaie dans un instant, ou écris à contact@shadowvote.fr.";
    }).finally(function () { btn.disabled = false; btn.textContent = "Envoyer mon message"; });
  });
})();
