# 📊 Rapport d'Analyse Complet — Sourire Pour Tous

> **Stack** : Angular 22 · TailwindCSS v4 · Supabase (Auth + Postgres + Storage) · TypeScript 6 · Vite build  
> **App** : http://localhost:4200/ · Production : https://sourire-pour-tous-site.vercel.app  
> **Date d'analyse** : 2026-08-06

---

## 📈 Scores Lighthouse (Audit en direct)

| Page | 🚀 Performance | ♿ Accessibilité | ✅ Best Practices | 🔍 SEO |
|------|:--------------:|:---------------:|:-----------------:|:------:|
| `/` Homepage | **25 / 100** 🔴 | 95 / 100 ✅ | 96 / 100 ✅ | 100 / 100 ✅ |
| `/contact` | **50 / 100** 🟠 | 100 / 100 ✅ | 100 / 100 ✅ | 100 / 100 ✅ |
| `/a-propos` | **50 / 100** 🟠 | 90 / 100 🟡 | 100 / 100 ✅ | 100 / 100 ✅ |

### 🎯 LCP Réel (PerformanceObserver)
- **Temps** : **3.02 secondes** — ⚠️ Limite du "bon" (< 2.5s)
- **Élément LCP** : `<img src="/assets/images/volunteers_team.png" alt="Équipe de Bénévoles">` *(about-block)*
- **Poids** : **889 KB** — image locale non compressée dans `/public/assets/images/`
- **LCP simulé Lighthouse (throttling)** : **53.4 secondes** 🔴 — catastrophique sur mobile lent

### 📦 Requêtes Réseau — Images lourdes identifiées
| Ressource | Taille | Problème |
|-----------|--------|----------|
| `volunteers_team.png` | **889 KB** | Image LCP locale, pas compressée |
| `tcl8w0nnwhj_...png` | **357 KB** | Image Supabase Storage (article) |
| `yse2oqr7gpr_...png` | **403 KB** | Image Supabase Storage (article) |
| `unsplash.com/fr/photos/...` | ❌ ERREUR | `net::ERR_BLOCKED_BY_ORB` — URL de page HTML pas d'image |

### ♿ Violations Accessibilité détectées
- **`/a-propos`** : Éléments `<dl>` (stats) non correctement structurés (items non wrappés)
- **Homepage** : Score 95 → violations mineures sur landmarks / heading hierarchy

---

## 🏗️ Architecture & Vue d'ensemble

### Structure du projet

```
src/app/
├── core/
│   ├── guards/      # authGuard (route protection)
│   ├── layouts/     # PublicLayout + AdminLayout
│   └── services/    # 8 services (Supabase, Auth, Articles, Messages, Pages, Settings, Team, Testimonials)
├── features/
│   ├── public/      # Home, About, Actions, Contact, Donate, News + 9 blocs CMS
│   └── admin/       # Dashboard, Login, 7 managers CRUD
└── shared/
    └── components/  # Navbar, Footer, Button
```

### Points forts architecturaux

- ✅ Structure modulaire claire avec séparation `features/public` vs `features/admin`
- ✅ Angular 22 avec Signals — approche réactive moderne (signal(), computed())
- ✅ `@if`, `@for`, `@switch` — nouvelle syntaxe template Angular 17+
- ✅ Lazy loading partiel (`DonatePage` chargé en lazy)
- ✅ Guards fonctionnel sur les routes admin (`authGuard`)
- ✅ Locale FR configurée dans `app.config.ts`
- ✅ Scroll restoration activé via `withInMemoryScrolling`
- ✅ Page système CMS (blocs configurables via `pages_blocks` en Supabase)

---

## 🔴 Problèmes Critiques

### 🔐 Sécurité — HAUTE PRIORITÉ

#### 1. Clé Supabase exposée dans le code source
```typescript
// src/environments/environment.ts ← COMMITÉ EN CLAIR
export const environment = {
  supabaseUrl: 'https://izsbdjerziyfalaqjkzo.supabase.co',
  supabaseKey: 'sb_publishable_qKvvvKtDBzra8xrahghSdw_t2m4CwkO'
};
```
> **Risque** : La clé est dans le `.git` et donc potentiellement exposée. Même si c'est une clé `anon`/publishable, elle doit être gérée via des variables d'environnement et non committée. Utiliser `.env` + `gitignore`.

**Piste** : Utiliser les variables d'environnement Vite/Angular (`import.meta.env.VITE_SUPABASE_URL`) et ajouter `environment.ts` au `.gitignore`.

#### 2. Double instanciation du client Supabase
```typescript
// MessagesService ← crée son propre client !
export class MessagesService {
  private supabase: SupabaseClient;
  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }
}
```
> Tous les autres services utilisent `SupabaseService` injectable, mais `MessagesService` crée sa propre instance. Cela signifie deux connexions WebSocket ouvertes, deux pools de connexion, et un risque de désynchronisation des sessions auth.

**Correction** : Injecter `SupabaseService` dans `MessagesService` comme les autres services.

#### 3. Absence de protection CSRF sur le formulaire de contact
Le formulaire de contact envoie directement en Supabase sans rate limiting côté serveur. Un bot pourrait spammer la table `messages`.

**Piste** : Ajouter un honeypot champ, ou configurer des Supabase Row Level Security (RLS) policies + rate limiting.

#### 4. Pas de validation de taille/type d'image côté client
```typescript
async onCoverFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    this.selectedCoverFile.set(input.files[0]); // Aucune validation !
  }
}
```
> Un admin pourrait uploader un fichier très lourd ou d'un type non attendu. Ajouter une vérification de taille (`< 5MB`) et de type MIME.

---

## 🟠 Performance

### LCP & Chargement Initial

> 🔴 **Performance homepage : 25/100 Lighthouse** | LCP réel : 3.02s | LCP simulé (mobile throttled) : 53.4s

#### 5. 🔴 IMAGE LCP = `volunteers_team.png` à **889 KB** — URGENCE
```html
<!-- about-block.html ligne 17 -->
<img src="/assets/images/volunteers_team.png" alt="Équipe de Bénévoles" class="object-cover w-full h-full">
<!-- Pas de width/height, pas de fetchpriority, pas de srcset ! -->
```
> L'élément LCP identifié n'est **pas le hero**, mais l'image de l'équipe dans la section About.
> Elle est stockée en local (`/public/assets/`) et pèse **889 KB non compressée**.
> C'est la cause principale du score de performance catastrophique.

**Corrections immédiates** :
- Convertir en **WebP** (gain ~70% : ~250 KB)
- Ajouter `fetchpriority="high"` car c'est le LCP
- Ajouter `width` et `height` pour éviter le CLS
- Ajouter `srcset` avec 3 breakpoints

#### 5b. Image hero chargée depuis Unsplash (CDN externe non maîtrisé)
```html
<!-- hero-block.html -->
<img src="https://images.unsplash.com/photo-1593113646773..." fetchpriority="high" loading="eager">
```
> ✅ `fetchpriority="high"` et `loading="eager"` sont bien présents.  
> ✅ `srcset` avec 3 breakpoints est bien configuré.  
> ❌ Dépendance à un CDN externe (Unsplash) → TTFB non maîtrisé.

**Piste** : Héberger l'image héro dans `/public/assets/images/` ou Supabase Storage.

#### 6. 5 polices Google Fonts chargées en parallèle
```html
<!-- index.html — 5 familles de polices différentes ! -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700
  &family=Montserrat:wght@400;500;600;700;800
  &family=Nunito:wght@400;600;700
  &family=Outfit:wght@400;500;600;700;800
  &family=Poppins:wght@300;400;500;600;700;800
  &display=swap" rel="stylesheet">
```
> **Problème majeur** : 5 familles de polices toutes chargées, c'est ~40-80kb de CSS de font + N requêtes réseau. La plupart ne sont utilisées qu'en fallback dans `styles.css`.

**Piste** : Réduire à **2 polices maximum** : `Poppins` (headings) + `Inter` (body). Supprimer `Montserrat`, `Nunito`, `Outfit`.

#### 7. Nombreux appels Supabase parallèles non optimisés sur la page home
Au chargement de `/`, la page orchestre **jusqu'à 8 appels API Supabase** en chaîne :
1. `getPageBlocks('home')` dans `HomeComponent`
2. `getPriorityArticle()` → `PriorityCampaignBlock`
3. `getRecentCampaigns(3)` → `RecentCampaignsBlock`
4. `getRecentNews(3)` → `RecentNewsBlock`
5. `getTestimonials(true)` → `TestimonialsBlock`
6. `getTeamMembers()` → `AboutBlock`
7. `getSettings()` → `StatsBlock`
8. `getSettings()` → `ContactBlock` (double appel settings!)

> Ces appels sont déclenchés séquentiellement par le cycle de vie des composants. Sans cache ni `Promise.all`, c'est au moins 4-6 round-trips réseau vers Supabase avant que la page soit complète.

**Piste** :
- Implémenter un cache mémoire simple dans `SettingsService` (le settings est appelé 2x)
- Charger les données critiques (hero, stats, settings) depuis le composant `Home` en parallèle avec `Promise.all()`
- Envisager un Angular Signal Store ou une couche de cache

#### 8. Absence de skeleton/loading states — CLS mesuré à **0.3** 🔴
Seul `Home` a un spinner global. Les blocs individuels (`PriorityCampaignBlock`, `RecentNewsBlock`, etc.) n'ont pas d'état de chargement : ils affichent simplement rien jusqu'au chargement, causant des **"sauts de layout" (Cumulative Layout Shift = 0.3 — seuil critique > 0.25)**.

> Lighthouse a mesuré un CLS de **0.3** sur la homepage — au-dessus du seuil POOR (> 0.25). C'est un Core Web Vital.

**Piste** : Ajouter des skeleton screens par bloc avec des dimensions fixes pour réserver l'espace.

#### 9. Aucun lazy loading sur les images hors viewport
```html
<!-- actions-block.html -->
<img src="https://images.unsplash.com/photo-..." alt="Aide Alimentaire">
<!-- Pas de loading="lazy" ! -->
```
Toutes les images de contenu (actions, about, recent-news) sont chargées immédiatement sans `loading="lazy"`.

**Piste** : Ajouter `loading="lazy"` sur toutes les images **sauf** celle du hero (LCP).

#### 10. Bundle non optimisé — pas de lazy loading des routes publiques
```typescript
// app.routes.ts — seule DonatePage est lazy-loaded
{ path: 'don', loadComponent: () => import('./features/public/donate/donate-page') }
// Toutes les autres pages sont importées statiquement !
import { Home } from './features/public/home/home';
import { NewsList } from './features/public/news/news-list/news-list';
// ...
```
> Le bundle initial inclut **tout le code public + admin**. Un visiteur qui arrive sur la home charge aussi tout le code de `ArticlesManager`, `TeamManager`, etc.

**Piste** : Lazy-loader toutes les routes (public et admin) avec `loadComponent`.

---

## 🟡 Ergonomie & UX

#### 11. Lien brisé dans actions-block
```html
<!-- actions-block.html — ligne 62 -->
<img src="https://unsplash.com/fr/photos/livre-de-lecture-dhomme-ocEpT2tKX5c" alt="Éducation">
```
> Ce n'est **pas** une URL d'image — c'est l'URL d'une page Unsplash. L'image ne s'affichera pas. Il faut l'URL de l'image directe (format `images.unsplash.com/...`).

#### 12. Pas de page 404 personnalisée
```typescript
// app.routes.ts
{ path: '**', redirectTo: '' }
```
> Le wildcard redirige vers la home, sans informer l'utilisateur qu'il a atteint une URL inexistante. Cela nuit au SEO (les crawlers ne reçoivent pas de statut 404) et à l'UX.

**Piste** : Créer un composant `NotFoundPage` avec un message clair et un lien vers la home.

#### 13. Données statiques hardcodées (non dynamiques) dans plusieurs sections critiques
- L'adresse dans `contact-page.html` est hardcodée (`123 Rue de la Solidarité, 75001 Paris`) alors que `settings.service.ts` expose un champ `address`
- Le téléphone dans la page contact (`+33 (0)1 23 45 67 89`) est aussi hardcodé
- Les données d'actions (`actions-block.html`) ne sont pas gérées par le CMS
- Les domaines d'intervention sont hardcodés en HTML alors que ce devrait être gérable par l'admin

#### 14. Formulaire de contact — UX des erreurs insuffisante
```typescript
// contact-page.ts
if (this.contactForm.invalid) return; // Silencieux !
```
Si l'utilisateur clique sur "Envoyer" avec un formulaire invalide, rien ne se passe (le bouton est `disabled` mais sans message d'aide). Les champs en erreur n'affichent pas de message d'erreur contextuel, juste un changement de couleur de bordure.

**Piste** : Afficher des messages d'erreur inline sous chaque champ invalide.

#### 15. Éditeur de contenu basique (textarea Markdown brut)
L'article manager utilise un `<textarea>` pour le contenu Markdown. C'est fonctionnel mais peu ergonomique pour un non-développeur.

**Piste** : Intégrer un éditeur WYSIWYG léger (ex: `Trix`, `Quill`, ou `ngx-editor`).

#### 16. Pas de confirmation visuelle après suppression
```typescript
async deleteArticle(id: string) {
  if (confirm('Voulez-vous vraiment supprimer cet article ?')) { // window.confirm natif
    await this.articlesService.deleteArticle(id);
    await this.loadArticles();
  }
}
```
> `window.confirm()` bloque le fil d'exécution et est visuellement incohérent avec le design. Utiliser une modale de confirmation custom.

#### 17. Page de don non complète / manquante
La route `/don` existe mais il n'existe qu'un seul fichier `donate-page.ts` qui n'a pas été exploré en détail. Si c'est une page de placeholder, c'est un manque fonctionnel critique pour une association caritative.

---

## 🟢 Accessibilité (a11y)

#### 18. Boutons de navigation du carousel sans label accessible
```html
<!-- about-block.html -->
<button (click)="scrollLeft(slider)" class="...">
  <svg ...>...</svg> <!-- Pas de aria-label ni sr-only ! -->
</button>
```
> Les boutons "Précédent" et "Suivant" du carousel d'équipe n'ont pas de texte accessible. Un lecteur d'écran lira un bouton vide.

**Correction** : Ajouter `aria-label="Membre précédent"` / `aria-label="Membre suivant"`.

#### 19. Attribut `lang` incorrect en anglais
```html
<!-- index.html -->
<html lang="en" class="scroll-smooth">
```
> Le site est **entièrement en français** mais déclare `lang="en"`. Les lecteurs d'écran utiliseront une voix anglaise pour lire le contenu français.

**Correction** : `<html lang="fr">`

#### 20. Hiérarchie des titres incorrecte dans plusieurs pages *(confirmé par Lighthouse a11y score 90)*
- `about-block.html` utilise `<p>` avec des styles de `<h2>` pour "Notre Mission" (ligne 7)
- `actions-block.html` utilise `<h2>` sans `<h1>` parent visible sur la home
- La home n'a pas de `<h1>` global (le titre dans hero-block n'est visible que si le CMS charge le bon config)
- **`<dl>` items sur `/a-propos`** non correctement structurés (détecté par Lighthouse accessibility audit)

**Piste** : Auditer et corriger la hiérarchie heading : une seule `<h1>` par page, puis `<h2>`, `<h3>` en ordre logique.

#### 21. Images sans alt dans le carousel d'équipe (cas conditionnel)
```html
<!-- about-block.html -->
<img [src]="member.image_url" [alt]="'Photo de ' + member.name">
```
> ✅ L'alt est présent. Mais si `member.name` est vide en BDD, l'alt sera `"Photo de "` — peu utile.

#### 22. Champs de formulaire sans `border` CSS visible au focus
```html
<input class="... focus:ring-primary focus:border-primary border-gray-300 ... outline-none">
```
> `outline-none` supprime l'outline natif. Le `focus:ring` de Tailwind devrait compenser, mais selon les versions, l'anneau peut ne pas être suffisamment visible.

#### 23. Contraste de texte à vérifier
- Texte `text-red-100` sur fond rouge `bg-primary` (hero subtitle) : le ratio peut être insuffisant
- Texte `text-gray-500` sur fond `bg-gray-50` : borderline selon WCAG AA

---

## 🔵 Bonnes Pratiques de Développement

#### 24. Absence totale de tests unitaires fonctionnels
Tous les fichiers `.spec.ts` existent mais ne contiennent que des tests placeholder :
```typescript
// home.spec.ts
it('should create', () => {
  expect(component).toBeTruthy(); // Test vide
});
```
> Il n'existe pas un seul test fonctionnel sur les services, guards, ou logique métier.

**Piste** : Écrire des tests pour :
- `authGuard` : tester la redirection si non connecté
- `ArticlesService` : mocker Supabase et tester les cas d'erreur
- `ContactPage` : tester la validation du formulaire

#### 25. Utilisation de `async/await` dans `ngOnInit` sans error handling
```typescript
// Partout dans les composants
async ngOnInit() {
  const data = await this.articlesService.getRecentNews(3); // Pas de try/catch !
  this.news.set(data);
}
```
> Si Supabase est indisponible, le composant échoue silencieusement (le service retourne `[]` mais aucun état d'erreur n'est affiché à l'utilisateur).

**Piste** : Ajouter un signal `hasError` et afficher un message d'erreur dans le template.

#### 26. `config: any` dans les interfaces
```typescript
// pages.service.ts
export interface PageBlock {
  config: any; // Typé any !
}
```
> L'utilisation de `any` perd les bénéfices de TypeScript. Définir des types discriminés pour chaque bloc.

#### 27. Nom de fichier de composants sans suffixe conventionnel Angular
```
home.ts → devrait être home.component.ts
stats-block.ts → devrait être stats-block.component.ts
```
> La convention Angular recommande le suffixe `.component.ts`. Bien que le projet soit cohérent en interne, cela peut dérouter des développeurs rejoignant le projet.

#### 28. Pas d'environnement de production séparé
```
src/environments/
└── environment.ts  (seulement development, pas d'environment.prod.ts)
```
> Il n'existe pas d'`environment.prod.ts`. Le fichier actuel a `production: false`. En production (Vercel), cela signifie que le mode `production: false` est utilisé.

**Piste** : Créer `environment.prod.ts` avec `production: true` et configurer `angular.json` pour les remplacements de fichiers (`fileReplacements`).

#### 29. `alert()` et `confirm()` natifs utilisés dans l'admin
```typescript
alert("Une erreur est survenue lors de l'enregistrement...");
if (confirm('Voulez-vous vraiment supprimer cet article ?'))
```
> `window.alert()` et `window.confirm()` sont des anti-patterns en Angular. Implémenter un système de toast/notification et une modale de confirmation.

#### 30. Génération de noms de fichiers avec `Math.random()` pour les uploads
```typescript
const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
```
> `Math.random()` n'est pas cryptographiquement sécurisé. Utiliser `crypto.randomUUID()` (disponible nativement).

---

## 🎨 UI/UX Design

### Points forts
- ✅ Design propre, cohérent, professionnel
- ✅ Palette de couleurs associative (rouge primaire = urgence/passion, vert secondaire = espoir)
- ✅ Animations subtiles (hover scale, bounce pour la flèche de scroll)
- ✅ Responsive mobile correct
- ✅ Animation des compteurs au scroll (IntersectionObserver) — très bonne idée
- ✅ Carousel de témoignages avec autoplay
- ✅ Barre de progression pour la campagne prioritaire

### Points à améliorer

#### 31. Absence de mode sombre (dark mode)
Le site ne supporte pas le mode sombre. Pour une association moderne voulant toucher tous les publics, c'est un plus.

#### 32. Pas d'animation au scroll (scroll-driven animations)
Les sections apparaissent statiquement. Des animations d'entrée subtiles (fade-in, slide-up) au scroll rendraient l'expérience plus engageante.

**Piste** : Utiliser les nouvelles CSS Scroll-Driven Animations ou `IntersectionObserver` (déjà utilisé pour les stats).

#### 33. Le bloc "À Propos" occupe beaucoup d'espace avec peu de contenu dynamique
Le contenu de la section About est hardcodé dans le HTML. Si l'association grandit, il sera difficile de mettre à jour les valeurs/textes sans passer par le code.

#### 34. Pas de feedback visuel de progression lors des uploads
Lors de l'upload d'images dans l'admin, il n'y a pas de barre de progression, seulement "Envoi..." comme texte.

#### 35. Page de don trop minimaliste
Sans voir le contenu exact de `DonatePage`, les méthodes de paiement listées dans les settings (Mobile Money, PayPal) suggèrent une page de don basique. Aucune intégration de paiement en ligne (Stripe, etc.) n'est visible.

---

## 🚀 SEO

#### 36. Balises `<title>` non dynamiques sur la plupart des pages
```typescript
// app.routes.ts — seulement 2 routes ont un title
{ path: 'actions', title: 'Nos Actions | Sourire Pour Tous' }
{ path: 'don', title: 'Faire un don | Sourire Pour Tous' }
// Les routes home, about, news, contact n'en ont pas !
```
> Sans `title`, ces pages utilisent le titre par défaut `Sourire Pour Tous` défini dans `index.html` — pas idéal pour le SEO.

**Piste** : Utiliser `TitleService` d'Angular dans chaque composant de page, ou ajouter `title` à toutes les routes.

#### 37. Pas de sitemap.xml ni de robots.txt
Aucun fichier SEO technique n'est visible dans `/public/`. Ces fichiers sont essentiels pour l'indexation correcte par les moteurs de recherche.

#### 38. URL de l'og:image pointe vers Vercel en dur
```html
<meta property="og:image" content="https://sourire-pour-tous-site.vercel.app/assets/images/logo.png">
```
> Cette URL est hardcodée pour la production Vercel mais ne fonctionnera pas en localhost ou si le domaine change.

---

## 📋 Tableau de Priorités

| # | Problème | Sévérité | Impact | Effort |
|---|----------|----------|--------|--------|
| 0 | **Image LCP 889KB** (volunteers_team.png) | 🔴 URGENT | Perf LCP 53s | Faible |
| 1 | Clé Supabase exposée dans le git | 🔴 Critique | Sécurité | Faible |
| 2 | Double instanciation Supabase client | 🔴 Critique | Perf + Bugs | Faible |
| 11 | Lien image brisé (Unsplash page URL) | 🔴 Critique | UX | Faible |
| 19 | `lang="en"` sur site français | 🔴 Critique | A11y + SEO | Faible |
| 6 | 5 polices Google chargées | 🟠 Élevé | Performance | Faible |
| 7 | 8 appels Supabase non optimisés | 🟠 Élevé | Performance | Moyen |
| 9 | Pas de `loading="lazy"` sur images | 🟠 Élevé | Performance | Faible |
| 10 | Pas de lazy loading des routes | 🟠 Élevé | Bundle size | Moyen |
| 12 | Pas de page 404 | 🟠 Élevé | UX + SEO | Faible |
| 13 | Données hardcodées (adresse, tel) | 🟠 Élevé | UX Admin | Moyen |
| 3 | Pas de rate limiting formulaire contact | 🟠 Élevé | Sécurité | Moyen |
| 8 | Pas de skeleton loading | 🟡 Moyen | UX | Moyen |
| 14 | Erreurs de formulaire non affichées | 🟡 Moyen | UX | Faible |
| 18 | Boutons carousel sans aria-label | 🟡 Moyen | A11y | Faible |
| 20 | Hiérarchie headings incorrecte | 🟡 Moyen | A11y + SEO | Moyen |
| 25 | Pas de error handling dans ngOnInit | 🟡 Moyen | Robustesse | Moyen |
| 28 | Pas d'environment.prod.ts | 🟡 Moyen | DevOps | Faible |
| 36 | Titles SEO manquants | 🟡 Moyen | SEO | Faible |
| 29 | alert/confirm natifs | 🟢 Faible | UX Admin | Moyen |
| 31 | Pas de dark mode | 🟢 Faible | UX | Élevé |
| 32 | Pas d'animations au scroll | 🟢 Faible | UX | Moyen |

---

## ✅ Plan d'action recommandé (Quick Wins)

### Sprint 1 — Corrections immédiates (< 1 jour)
1. **🔴 Compresser `volunteers_team.png`** → WebP < 150KB + `fetchpriority="high"` + `width/height`
2. **Fix `lang="en"` → `lang="fr"`** dans `index.html`
3. **Fix image brisée** dans `actions-block.html` (ligne 62)
4. **Fix double client Supabase** dans `MessagesService`
5. **Supprimer Montserrat, Nunito, Outfit** de `index.html` (garder Poppins + Inter)
6. **Ajouter `loading="lazy"`** sur toutes les images sauf le hero ET `volunteers_team.png`
7. **Ajouter `aria-label`** sur les boutons de navigation des carousels
8. **Ajouter `title`** aux routes manquantes dans `app.routes.ts`
9. **Fix `<dl>` structure** sur la page `/a-propos` (items `<dt>/<dd>` correctement wrappés)

### Sprint 2 — Améliorations importantes (2-3 jours)
1. **Migrer les clés** vers `.env` + configurer `angular.json` fileReplacements
2. **Lazy-loader toutes les routes** via `loadComponent`
3. **Cache dans SettingsService** (un seul appel, mémoïsé)
4. **Créer `NotFoundPage`** avec redirect propre
5. **Afficher les erreurs formulaire** inline dans `contact-page.html`
6. **Connecter adresse/tel** depuis les settings dans `contact-page.html`
7. **Ajouter `crypto.randomUUID()`** pour les uploads

### Sprint 3 — Qualité & Robustesse (1 semaine)
1. **Écrire des tests** pour les services et guards
2. **Système toast/notification** pour remplacer `alert/confirm`
3. **Skeleton screens** pour les blocs dynamiques
4. **Erreur handling** dans tous les composants async
5. **Sitemap.xml + robots.txt** dans `/public/`
6. **Éditeur WYSIWYG** dans l'articles manager

---

---

## 🛠️ Commande rapide — Compresser l'image LCP

```bash
# Installer cwebp si pas disponible
apt-get install webp

# Convertir volunteers_team.png en WebP avec qualité 80
cwebp -q 80 public/assets/images/volunteers_team.png -o public/assets/images/volunteers_team.webp

# Résultat attendu : ~889KB → ~200KB (~77% de réduction)
```

Ensuite dans `about-block.html`, utiliser `<picture>` pour le fallback :
```html
<picture>
  <source srcset="/assets/images/volunteers_team.webp" type="image/webp">
  <img src="/assets/images/volunteers_team.png"
       alt="Équipe de Bénévoles"
       fetchpriority="high"
       width="800" height="550"
       class="object-cover w-full h-full">
</picture>
```

---

*Rapport généré suite à une analyse statique approfondie du code source + audit Lighthouse en direct via Chrome DevTools (Puppeteer). Scores vérifiés sur `localhost:4200`.*
