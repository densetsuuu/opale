# Plan de développement - Outil de Staffing Opale

## Vue d'ensemble

Outil de staffing moderne permettant aux collaborateurs de:

- Renseigner différents types de journées sur un calendrier
- Consulter les calendriers des collègues
- Gérer des plans de charge sur les projets
- Organiser les équipes avec contrôle d'accès ABAC

## Stack technique

### Backend

- **Framework**: AdonisJS 7 (Next)
- **Base de données**: PostgreSQL
- **ORM**: Lucid
- **Auth**: AdonisJS Auth (existant)
- **Type-safety**: Tuyau (API type-safe)

### Frontend

- **Framework**: React 19
- **Router**: TanStack Router
- **State/Data**: TanStack Query
- **UI**: ShadcnUI + TailwindCSS 4 + Radix UI
- **Build**: Vite

### Librairies additionnelles à installer

- **Tables**: `@tanstack/react-table` (tableaux type Excel)
- **Calendrier**: `react-big-calendar` (vues calendrier)
- **Graphiques**: `recharts` (visualisations plan de charge)
- **Dates**: `date-fns` (manipulation dates)

## Architecture de données

### Entités principales

#### Organizations & Teams

```typescript
Organization {
  id: uuid
  name: string
  slug: string
  settings: json
  created_at: timestamp
  updated_at: timestamp
}

Team {
  id: uuid
  organization_id: uuid
  name: string
  description: string
  created_at: timestamp
  updated_at: timestamp
}

TeamMember {
  id: uuid
  team_id: uuid
  user_id: uuid
  role_id: uuid
  joined_at: timestamp
}
```

#### ABAC (Attribute-Based Access Control)

```typescript
Role {
  id: uuid
  organization_id: uuid
  name: string
  description: string
  is_system: boolean
  created_at: timestamp
}

Permission {
  id: uuid
  role_id: uuid
  resource: string // 'calendar', 'workload', 'team', etc.
  action: string // 'read', 'write', 'delete', 'manage'
  conditions: json // attributs pour ABAC
  created_at: timestamp
}
```

**Rôles système suggérés:**

- **Super Admin**: Accès total à toutes les organisations
- **Org Admin**: Gestion complète de son organisation
- **Team Manager**: Gestion de son équipe + plans de charge
- **Team Member**: Saisie calendrier + lecture équipe
- **Guest**: Lecture seule

#### Staffing (Calendrier)

```typescript
TimeEntryType {
  id: uuid
  organization_id: uuid
  name: string // 'Congés', 'Formation', 'Client', 'Interne', etc.
  code: string // 'LEAVE', 'TRAINING', 'CLIENT', 'INTERNAL'
  color: string // '#FF5733'
  is_billable: boolean
  is_system: boolean
  created_at: timestamp
}

TimeEntry {
  id: uuid
  user_id: uuid
  team_id: uuid
  type_id: uuid
  date: date
  duration: decimal // en jours (0.5, 1, etc.)
  notes: text
  created_at: timestamp
  updated_at: timestamp
}
```

#### Workload (Plan de charge)

```typescript
Project {
  id: uuid
  organization_id: uuid
  team_id: uuid
  name: string
  code: string
  client: string
  start_date: date
  end_date: date
  status: enum // 'draft', 'active', 'completed', 'cancelled'
  created_at: timestamp
  updated_at: timestamp
}

WorkloadPlan {
  id: uuid
  project_id: uuid
  name: string
  period_start: date
  period_end: date
  created_by: uuid
  created_at: timestamp
  updated_at: timestamp
}

WorkloadAllocation {
  id: uuid
  workload_plan_id: uuid
  user_id: uuid
  allocation_percent: decimal // 0-100
  start_date: date
  end_date: date
  notes: text
  created_at: timestamp
  updated_at: timestamp
}
```

## Phases de développement

### Phase 1: Fondations (Semaine 1-2)

**Issues**: `opale-wrh`, `opale-2vf`

#### 1.1 Modèle de données

- [ ] Créer toutes les migrations
- [ ] Créer les models Lucid avec relations
- [ ] Seeders pour données de test (types de journées, rôles système)

#### 1.2 Système ABAC

- [ ] Service d'autorisation (`AuthorizationService`)
- [ ] Middleware `authorize`
- [ ] Abilities pour chaque ressource
- [ ] Policies pour Organizations, Teams, TimeEntries, Workload

**Exemple de règle ABAC:**

```typescript
// Un user peut voir les calendriers de son équipe
can("read", "calendar", {
  where: {
    team_id: { $in: user.teamIds },
  },
});

// Un manager peut éditer les plans de charge de ses projets
can("write", "workload", {
  where: {
    project: {
      team_id: { $in: user.managedTeamIds },
    },
  },
});
```

### Phase 2: Backend API (Semaine 2-4)

**Issues**: `opale-rky`, `opale-kna`, `opale-5yv`

#### 2.1 Module Organizations

**Structure:**

```
app/organizations/
├── controllers/
│   ├── organizations_controller.ts
│   └── teams_controller.ts
├── models/
│   ├── organization.ts
│   ├── team.ts
│   └── team_member.ts
├── validators/
│   ├── organization.ts
│   └── team.ts
├── transformers/
│   ├── organization_transformer.ts
│   └── team_transformer.ts
└── policies/
    ├── organization_policy.ts
    └── team_policy.ts
```

**Endpoints:**

- `GET /api/organizations` - Liste
- `POST /api/organizations` - Créer
- `GET /api/organizations/:id` - Détails
- `PUT /api/organizations/:id` - Modifier
- `DELETE /api/organizations/:id` - Supprimer
- `GET /api/organizations/:id/teams` - Teams de l'org
- `POST /api/teams` - Créer une équipe
- `POST /api/teams/:id/members` - Ajouter un membre
- `PUT /api/teams/:id/members/:userId` - Modifier rôle
- `DELETE /api/teams/:id/members/:userId` - Retirer membre

#### 2.2 Module Staffing

**Structure:**

```
app/staffing/
├── controllers/
│   ├── time_entries_controller.ts
│   └── time_entry_types_controller.ts
├── models/
│   ├── time_entry.ts
│   └── time_entry_type.ts
├── validators/
│   └── time_entry.ts
├── transformers/
│   └── time_entry_transformer.ts
└── policies/
    └── time_entry_policy.ts
```

**Endpoints:**

- `GET /api/time-entries` - Liste avec filtres (user, team, date range)
- `POST /api/time-entries` - Créer
- `PUT /api/time-entries/:id` - Modifier
- `DELETE /api/time-entries/:id` - Supprimer
- `GET /api/time-entries/calendar` - Vue calendrier optimisée
- `POST /api/time-entries/bulk` - Création en masse
- `GET /api/time-entry-types` - Types disponibles
- `POST /api/time-entry-types` - Créer un type (admin)

**Optimisations:**

- Index sur `user_id`, `team_id`, `date`
- Vue matérialisée pour agrégations calendrier
- Cache Redis pour vues fréquentes

#### 2.3 Module Workload

**Structure:**

```
app/workload/
├── controllers/
│   ├── projects_controller.ts
│   ├── workload_plans_controller.ts
│   └── allocations_controller.ts
├── models/
│   ├── project.ts
│   ├── workload_plan.ts
│   └── workload_allocation.ts
├── validators/
│   ├── project.ts
│   └── workload_plan.ts
├── transformers/
│   ├── project_transformer.ts
│   └── workload_plan_transformer.ts
└── policies/
    ├── project_policy.ts
    └── workload_plan_policy.ts
```

**Endpoints:**

- `GET /api/projects` - Liste des projets
- `POST /api/projects` - Créer
- `GET /api/workload-plans` - Plans de charge
- `POST /api/workload-plans` - Créer un plan
- `GET /api/workload-plans/:id` - Détails
- `POST /api/workload-plans/:id/allocations` - Allouer ressources
- `PUT /api/workload-plans/:id/allocations/:allocationId` - Modifier
- `DELETE /api/workload-plans/:id/allocations/:allocationId` - Supprimer
- `GET /api/workload-plans/:id/summary` - Résumé (charge totale, sur-allocations)
- `GET /api/users/:id/workload` - Charge d'un user

**Calculs automatiques:**

```typescript
// Détection sur-allocation
const totalAllocation = allocations
  .filter((a) => isDateInRange(date, a.start_date, a.end_date))
  .reduce((sum, a) => sum + a.allocation_percent, 0);

if (totalAllocation > 100) {
  // Alerte sur-allocation
}

// Calcul jours/homme
const workDays = calculateWorkDays(start_date, end_date);
const manDays = (workDays * allocation_percent) / 100;
```

### Phase 3: Frontend - Composants UI (Semaine 4-6)

**Issues**: `opale-210`, `opale-bql`, `opale-leo`, `opale-2zd`

#### 3.1 Installation librairies

```bash
cd apps/app
pnpm add @tanstack/react-table react-big-calendar recharts date-fns
pnpm add -D @types/react-big-calendar
```

#### 3.2 Composants ShadcnUI à ajouter

```bash
# Via CLI ShadcnUI (si disponible) ou copier manuellement
npx shadcn@latest add table
npx shadcn@latest add calendar
npx shadcn@latest add select
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add tabs
npx shadcn@latest add badge
npx shadcn@latest add avatar
npx shadcn@latest add popover
npx shadcn@latest add command
npx shadcn@latest add sheet
npx shadcn@latest add toast
```

#### 3.3 Composants custom - Calendrier

```
src/components/calendar/
├── calendar-grid.tsx          # Grille principale du calendrier
├── calendar-header.tsx        # Header avec navigation mois/semaine
├── time-entry-cell.tsx        # Cellule éditable pour saisie
├── time-entry-modal.tsx       # Modal de création/édition
├── team-calendar-view.tsx     # Vue multi-utilisateurs
├── calendar-filters.tsx       # Filtres (équipe, type, user)
└── calendar-legend.tsx        # Légende des types de journées
```

**Features:**

- Drag & drop pour déplacer des entrées
- Édition inline au clic
- Codes couleur par type
- Tooltips avec détails
- Export Excel/CSV

#### 3.4 Composants custom - Plan de charge

```
src/components/workload/
├── workload-table.tsx         # Table principale (TanStack Table)
├── allocation-row.tsx         # Ligne d'allocation éditable
├── resource-selector.tsx      # Sélecteur de ressources
├── workload-chart.tsx         # Graphique de charge (Recharts)
├── project-form.tsx           # Formulaire projet
└── allocation-indicators.tsx  # Indicateurs visuels (%, sur-allocation)
```

**Features:**

- Table éditable type Excel
- Calcul automatique des totaux
- Indicateurs de charge (vert/orange/rouge)
- Vue graphique (bar chart ou Gantt)
- Export PDF/Excel

#### 3.5 Composants shared

```
src/components/shared/
├── data-table.tsx             # Table réutilisable avec tri/filtres
├── editable-cell.tsx          # Cellule éditable générique
├── user-avatar.tsx            # Avatar utilisateur
├── date-range-picker.tsx      # Sélecteur de période
└── export-button.tsx          # Bouton export (Excel/CSV/PDF)
```

#### 3.6 Composants organisations

```
src/components/organizations/
├── team-selector.tsx          # Dropdown sélection équipe
├── member-list.tsx            # Liste des membres
├── role-badge.tsx             # Badge de rôle
├── invite-member-dialog.tsx   # Modal invitation
└── permissions-matrix.tsx     # Matrice de permissions (admin)
```

### Phase 4: Features principales (Semaine 6-10)

**Issues**: `opale-2l8`, `opale-5bp`, `opale-gbd`

#### 4.1 Calendrier de staffing

**Routes:**

```
src/routes/(app)/calendar/
├── index.tsx                  # Vue calendrier principale
├── team.tsx                   # Vue équipe
└── settings.tsx               # Configuration types de journées
```

**Features:**

- Vue mensuelle/hebdomadaire/journalière
- Saisie rapide par clic
- Types de journées configurables avec couleurs
- Filtres: équipe, utilisateur, type, période
- Vue "Mes collègues" pour voir calendriers équipe
- Export Excel/CSV
- Statistiques (jours par type, taux présence)

**UX:**

- Drag & drop pour déplacer
- Double-clic pour éditer
- Raccourcis clavier (n: nouvelle entrée, e: éditer, suppr: supprimer)
- Indicateurs visuels clairs
- Responsive (mobile-friendly)

#### 4.2 Plan de charge

**Routes:**

```
src/routes/(app)/workload/
├── index.tsx                  # Liste des plans
├── $planId.tsx                # Détails d'un plan
├── new.tsx                    # Créer un plan
└── projects/
    ├── index.tsx              # Liste projets
    └── $projectId.tsx         # Détails projet
```

**Features:**

- Création de projets avec dates
- Allocation de ressources (users) sur projets
- Vue tableau avec colonnes: Projet, Ressource, Allocation (%), Dates, Charge (j/h)
- Calcul automatique de la charge
- Détection des sur-allocations (>100%)
- Vue graphique (bar chart par user/projet)
- Filtres par équipe, projet, période
- Export PDF/Excel

**Indicateurs:**

- Vert: <80% (sous-utilisé)
- Orange: 80-100% (optimal)
- Rouge: >100% (sur-alloué)

**Calculs:**

```typescript
// Charge totale d'un user sur une période
const totalWorkload = allocations
  .filter((a) => overlaps(a.period, selectedPeriod))
  .reduce((sum, a) => {
    const days = calculateWorkDays(a.start_date, a.end_date);
    return sum + (days * a.allocation_percent) / 100;
  }, 0);

// Disponibilité
const availability = totalWorkDays - totalWorkload;
```

#### 4.3 Gestion organisations & ABAC

**Routes:**

```
src/routes/(app)/settings/
├── organization.tsx           # Paramètres org
├── teams.tsx                  # Gestion équipes
├── members.tsx                # Gestion membres
└── roles.tsx                  # Gestion rôles et permissions
```

**Features:**

- Création d'organisations et équipes
- Invitation de membres par email
- Attribution de rôles avec permissions
- Matrice de permissions configurable (admin)
- Gestion des accès aux calendriers et plans
- Audit log des modifications

**Matrice de permissions (exemple):**

```
                  | Read Calendar | Write Calendar | Read Workload | Write Workload | Manage Team |
------------------|---------------|----------------|---------------|----------------|-------------|
Super Admin       | ✓             | ✓              | ✓             | ✓              | ✓           |
Org Admin         | ✓             | ✓              | ✓             | ✓              | ✓           |
Team Manager      | ✓ (team)      | ✓ (team)       | ✓ (team)      | ✓ (team)       | ✓ (own)     |
Team Member       | ✓ (team)      | ✓ (own)        | ✓ (team)      | ✗              | ✗           |
Guest             | ✓ (team)      | ✗              | ✓ (team)      | ✗              | ✗           |
```

### Phase 5: Features avancées (Semaine 11-12)

**Issues**: `opale-ikn`, `opale-bdu`, `opale-88p`

#### 5.1 Notifications

- Nouveau membre dans l'équipe
- Modification de plan de charge
- Sur-allocation détectée
- Demande de congés (si workflow approbation)
- Système de notifications in-app + email

#### 5.2 Audit log

- Historique de toutes les modifications
- Qui a fait quoi et quand
- Filtres par user, ressource, action
- Export pour compliance

#### 5.3 Templates de plans

- Sauvegarder un plan comme template
- Réutiliser pour nouveaux projets
- Bibliothèque de templates d'équipe

#### 5.4 Rapports et analytics

**Dashboards:**

- Taux d'occupation par user/équipe
- Répartition des types de journées
- Charge par projet
- Tendances temporelles
- Prévisions de charge

**Graphiques:**

- Bar charts (charge par user)
- Pie charts (répartition types)
- Line charts (évolution dans le temps)
- Heatmaps (disponibilité équipe)

#### 5.5 Optimisations

- **Cache Redis**: Vues calendrier fréquentes
- **Pagination**: TanStack Table avec virtualisation
- **Optimistic updates**: Meilleure UX avec TanStack Query
- **WebSockets** (optionnel): Collaboration temps réel
- **Lazy loading**: Routes et composants
- **Debouncing**: Recherches et filtres

#### 5.6 API publique

- Endpoints pour intégrations externes
- Webhooks pour événements
- Documentation OpenAPI/Swagger
- Rate limiting

## Commandes bd pour tracking

### Voir les issues disponibles

```bash
bd list
bd ready  # Issues prêtes à être traitées
```

### Travailler sur une issue

```bash
bd show opale-wrh  # Voir détails
bd update opale-wrh --status in_progress  # Commencer
bd close opale-wrh  # Terminer
```

### Synchronisation

```bash
bd sync  # Sync avec git
```

## Prochaines étapes

1. **Commencer par Phase 1** (`opale-wrh`, `opale-2vf`)
   - Créer les migrations
   - Implémenter le système ABAC

2. **Valider l'architecture** avec un prototype
   - Créer une org, une équipe, un user
   - Tester les permissions
   - Créer quelques time entries

3. **Itérer** sur les phases suivantes

## Notes techniques

### Choix ABAC vs RBAC

**ABAC choisi** car:

- Plus flexible pour multi-tenant
- Permissions basées sur attributs (org, team, ownership)
- Meilleur pour scénarios complexes (voir calendrier équipe mais pas modifier)
- Évolutif (nouvelles règles sans nouveaux rôles)

### Performance

- Index sur colonnes fréquemment filtrées
- Cache Redis pour vues agrégées
- Pagination côté serveur
- Virtualisation côté client (grandes listes)

### Sécurité

- ABAC pour toutes les opérations
- Validation côté serveur (VineJS)
- CSRF protection (AdonisJS Shield)
- Rate limiting sur API
- Audit log pour traçabilité

### UX moderne

- ShadcnUI pour cohérence visuelle
- Animations fluides (TailwindCSS)
- Feedback immédiat (optimistic updates)
- Raccourcis clavier
- Responsive design
- Dark mode (optionnel)

## Ressources

- [AdonisJS Docs](https://docs.adonisjs.com)
- [TanStack Table](https://tanstack.com/table)
- [React Big Calendar](https://jquense.github.io/react-big-calendar)
- [Recharts](https://recharts.org)
- [ShadcnUI](https://ui.shadcn.com)

---

**Créé le**: 2026-01-01
**Dernière mise à jour**: 2026-01-01
