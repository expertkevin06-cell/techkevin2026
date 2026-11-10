# TechKevin2026
PWA de diagnostic automobile 2018‑2027 (21 000 fiches DTC, pannes connues/TSB, rappels, veille auto, PDF, accès tiers par notification).

## Déploiement
1. Publier ce dépôt sur GitHub Pages (branche `main`, racine).
2. Le workflow `.github/workflows/veille.yml` génère tous les 15 j `veille.json`, `data/veille-pack.json`, `data/catalog-pack.json`.
3. Ouvrir l'URL Pages → l'appli s'installe (PWA) ; autocontrôle 🩺 au démarrage.

## APK / packages (PWABuilder)
1. Ouvrir l'appli en HTTPS puis bouton **📦** (ou 🩺 → PWABuilder) : ouvre `pwabuilder.com` avec l'URL pré‑remplie.
2. PWABuilder → *Package options* → **Android (APK/AAB)** : le manifest (id, icônes 192/512/maskable, theme) est déjà conforme.
3. Télécharger le build signé ou le générer localement (Bubblewrap). Le SW met en cache tout le nécessaire hors ligne.

## Sécurité
- Admin : mot de passe unique `Kevin83600` (hash SHA‑256, jamais affiché).
- Tiers : demande par notification (ntfy.sh) → admin coche ✅ Accorder / ⛔ Refuser / 🚫 Révoquer (temps réel, poll 20 s).
