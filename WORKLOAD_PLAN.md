# WORKLOAD_PLAN.md - Plan de charge (Workload)

## 📋 Vue d'ensemble

### Objectif

Module de gestion de plans de charge permettant de :

- Créer des plans de charge avec périodes et étapes de livraison customisables
- Allouer des ressources (intervenants) sur des tâches par semaine
- Suivre la consommation, l'avancement et le reste à faire
- Détecter les sur-allocations (>5j par semaine)
- Visualiser la charge par intervenant

### Décisions architecturales validées

| Décision               | Choix                                         |
| ---------------------- | --------------------------------------------- |
| **Approche**           | Vertical slicing (feature par feature)        |
| **Granularité**        | Par semaine (0-5 jours)                       |
| **Format semaines**    | ISO week (`"2026-W01"`, `"2026-W02"`)         |
| **Colonnes calculées** | Conso (auto), Avancement (auto), Reste (auto) |
| **Estimation**         | Éditable manuellement                         |
| **Création items**     | Bouton "+" à côté de chaque ligne             |
| **Suppression**        | Icône poubelle + menu contextuel (clic droit) |
| **Sauvegarde**         | Auto-save avec optimistic updates             |
| **Validation**         | Bloquer saisie >5j par semaine                |
| **Tests**              | Tous (unitaires + intégration + E2E)          |
| **Documentation**      | Aucune                                        |
| **Design system**      | Corner squircle sur tous composants ShadcnUI  |

### Stack technique

**Backend:**

- AdonisJS 7 (Next)
- PostgreSQL
- Lucid ORM
- VineJS (validation)
- Girouette (routing)
- Tuyau (type-safety)

**Frontend:**

- React 19
- TanStack Router
- TanStack Query
- TanStack Table + react-virtual
- ShadcnUI + TailwindCSS 4
- date-fns

---

## 🗄️ Architecture de données

### Tables SQL

#### workload_plans

```sql
CREATE TABLE workload_plans (
  id UUID PRIMARY KEY NOT NULL,
  name VARCHAR(255) NOT NULL,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  delivery_stages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP
);

CREATE INDEX idx_workload_plans_team_id ON workload_plans(team_id);
CREATE INDEX idx_workload_plans_period ON workload_plans(period_start, period_end);
```

**delivery_stages structure:**

```json
["Liv. SFD", "Liv. Recette", "MEP"]
```

#### workload_items

```sql
CREATE TABLE workload_items (
  id UUID PRIMARY KEY NOT NULL,
  workload_plan_id UUID NOT NULL REFERENCES workload_plans(id) ON DELETE CASCADE,
  project VARCHAR(255) NOT NULL,
  scope VARCHAR(255) NOT NULL,
  task VARCHAR(255) NOT NULL,
  resource_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  estimated_days DECIMAL(10,2) NOT NULL CHECK (estimated_days >= 0),
  weekly_allocations JSONB NOT NULL DEFAULT '{}',
  delivery_dates JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP
);

CREATE INDEX idx_workload_items_plan_id ON workload_items(workload_plan_id);
CREATE INDEX idx_workload_items_resource_id ON workload_items(resource_id);
CREATE INDEX idx_workload_items_plan_resource ON workload_items(workload_plan_id, resource_id);
```

**weekly_allocations structure:**

```json
{
  "2026-W01": 3,
  "2026-W02": 5,
  "2026-W03": 2.5,
  "2026-W04": 4
}
```

**delivery_dates structure:**

```json
{
  "Liv. SFD": "2026-03-15",
  "Liv. Recette": "2026-04-01",
  "MEP": "2026-04-15"
}
```

### Migrations

**Migration 1: create_workload_plans_table.ts**

```typescript
import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
  protected tableName = "workload_plans";

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid("id").primary().notNullable();
      table
        .uuid("team_id")
        .notNullable()
        .references("id")
        .inTable("teams")
        .onDelete("CASCADE");
      table.string("name", 255).notNullable();
      table.date("period_start").notNullable();
      table.date("period_end").notNullable();
      table.jsonb("delivery_stages").notNullable().defaultTo("[]");
      table.timestamp("created_at").notNullable();
      table.timestamp("updated_at").nullable();

      table.index("team_id");
      table.index(["period_start", "period_end"]);
    });
  }

  async down() {
    this.schema.dropTable(this.tableName);
  }
}
```

**Migration 2: create_workload_items_table.ts**

```typescript
import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
  protected tableName = "workload_items";

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid("id").primary().notNullable();
      table
        .uuid("workload_plan_id")
        .notNullable()
        .references("id")
        .inTable("workload_plans")
        .onDelete("CASCADE");
      table.string("project", 255).notNullable();
      table.string("scope", 255).notNullable();
      table.string("task", 255).notNullable();
      table
        .uuid("resource_id")
        .notNullable()
        .references("id")
        .inTable("users")
        .onDelete("RESTRICT");
      table.decimal("estimated_days", 10, 2).notNullable().checkPositive();
      table.jsonb("weekly_allocations").notNullable().defaultTo("{}");
      table.jsonb("delivery_dates").notNullable().defaultTo("{}");
      table.timestamp("created_at").notNullable();
      table.timestamp("updated_at").nullable();

      table.index("workload_plan_id");
      table.index("resource_id");
      table.index(["workload_plan_id", "resource_id"]);
    });
  }

  async down() {
    this.schema.dropTable(this.tableName);
  }
}
```

---

## 🔧 Backend - API

### Structure des modules

```
app/workload/
├── models/
│   ├── workload_plan.ts
│   └── workload_item.ts
├── controllers/
│   ├── workload_plans_controller.ts
│   └── workload_items_controller.ts
├── validators/
│   ├── workload_plan.ts
│   └── workload_item.ts
└── transformers/
    ├── workload_plan_transformer.ts
    └── workload_item_transformer.ts
```

### Models

**app/workload/models/workload_plan.ts**

```typescript
import { BaseModel, column, hasMany } from "@adonisjs/lucid/orm";
import { compose } from "@adonisjs/core/helpers";
import type { HasMany } from "@adonisjs/lucid/types/relations";
import { DateTime } from "luxon";

import { WithPrimaryUuid } from "#core/mixins/with_uuid_pk";
import { WithTimestamps } from "#core/mixins/with_timestamps";
import WorkloadItem from "./workload_item.js";

export default class WorkloadPlan extends compose(
  BaseModel,
  WithTimestamps,
  WithPrimaryUuid,
) {
  @column() declare name: string;
  @column() declare teamId: string;
  @column.date() declare periodStart: DateTime;
  @column.date() declare periodEnd: DateTime;
  @column({
    prepare: (value: string[]) => JSON.stringify(value),
    consume: (value: string) => JSON.parse(value),
  })
  declare deliveryStages: string[];

  @hasMany(() => WorkloadItem) declare items: HasMany<typeof WorkloadItem>;

  get weekCount(): number {
    const start = this.periodStart.startOf("week");
    const end = this.periodEnd.endOf("week");
    return Math.ceil(end.diff(start, "weeks").weeks);
  }

  getWeeks(): string[] {
    const weeks: string[] = [];
    let current = this.periodStart.startOf("week");
    const end = this.periodEnd.endOf("week");

    while (current <= end) {
      weeks.push(current.toFormat("kkkk-'W'WW"));
      current = current.plus({ weeks: 1 });
    }

    return weeks;
  }
}
```

**app/workload/models/workload_item.ts**

```typescript
import { BaseModel, column, belongsTo, computed } from "@adonisjs/lucid/orm";
import { compose } from "@adonisjs/core/helpers";
import type { BelongsTo } from "@adonisjs/lucid/types/relations";
import { DateTime } from "luxon";

import { WithPrimaryUuid } from "#core/mixins/with_uuid_pk";
import { WithTimestamps } from "#core/mixins/with_timestamps";
import WorkloadPlan from "./workload_plan.js";
import User from "#identity/models/user";

type WeeklyAllocations = Record<string, number>;
type DeliveryDates = Record<string, string>;

export default class WorkloadItem extends compose(
  BaseModel,
  WithTimestamps,
  WithPrimaryUuid,
) {
  @column() declare workloadPlanId: string;
  @column() declare project: string;
  @column() declare scope: string;
  @column() declare task: string;
  @column() declare resourceId: string;
  @column() declare estimatedDays: number;

  @column({
    prepare: (value: WeeklyAllocations) => JSON.stringify(value),
    consume: (value: string) => JSON.parse(value),
  })
  declare weeklyAllocations: WeeklyAllocations;

  @column({
    prepare: (value: DeliveryDates) => JSON.stringify(value),
    consume: (value: string) => JSON.parse(value),
  })
  declare deliveryDates: DeliveryDates;

  @belongsTo(() => WorkloadPlan) declare plan: BelongsTo<typeof WorkloadPlan>;
  @belongsTo(() => User, { foreignKey: "resourceId" })
  declare resource: BelongsTo<typeof User>;

  @computed()
  get consumedDays(): number {
    const currentWeek = DateTime.now().toFormat("kkkk-'W'WW");
    return Object.entries(this.weeklyAllocations)
      .filter(([week]) => week < currentWeek)
      .reduce((sum, [_, days]) => sum + days, 0);
  }

  @computed()
  get progressPercent(): number {
    if (this.estimatedDays === 0) return 0;
    return Math.round((this.consumedDays / this.estimatedDays) * 100);
  }

  @computed()
  get remainingDays(): number {
    return Math.max(0, this.estimatedDays - this.consumedDays);
  }

  getAllocationForWeek(week: string): number {
    return this.weeklyAllocations[week] || 0;
  }

  setAllocationForWeek(week: string, days: number): void {
    this.weeklyAllocations[week] = days;
  }
}
```

### Controllers

**app/workload/controllers/workload_plans_controller.ts**

```typescript
import { HttpContext } from "@adonisjs/core/http";
import {
  Get,
  Group,
  Middleware,
  Post,
  Put,
  Delete,
} from "@adonisjs-community/girouette";
import { middleware } from "#start/kernel";

import WorkloadPlan from "../models/workload_plan.js";
import WorkloadItem from "../models/workload_item.js";
import WorkloadPlanTransformer from "../transformers/workload_plan_transformer.js";
import {
  createWorkloadPlanValidator,
  updateWorkloadPlanValidator,
} from "../validators/workload_plan.js";

@Group({ name: "workload.plans", prefix: "/workload-plans" })
@Middleware(middleware.auth())
export default class WorkloadPlansController {
  @Get("/")
  async index({ serialize }: HttpContext) {
    const plans = await WorkloadPlan.query().preload("items");
    return await serialize(WorkloadPlanTransformer.collection(plans));
  }

  @Post("/")
  async store({ request, serialize }: HttpContext) {
    const payload = await request.validateUsing(createWorkloadPlanValidator);
    const plan = await WorkloadPlan.create(payload);
    return await serialize(WorkloadPlanTransformer.transform(plan));
  }

  @Get("/:id")
  async show({ params, serialize }: HttpContext) {
    const plan = await WorkloadPlan.query()
      .where("id", params.id)
      .preload("items", (query) => query.preload("resource"))
      .firstOrFail();

    return await serialize(WorkloadPlanTransformer.transform(plan));
  }

  @Put("/:id")
  async update({ params, request, serialize }: HttpContext) {
    const plan = await WorkloadPlan.findOrFail(params.id);
    const payload = await request.validateUsing(updateWorkloadPlanValidator);

    plan.merge(payload);
    await plan.save();

    return await serialize(WorkloadPlanTransformer.transform(plan));
  }

  @Delete("/:id")
  async destroy({ params, response }: HttpContext) {
    const plan = await WorkloadPlan.findOrFail(params.id);
    await plan.delete();
    return response.noContent();
  }

  @Get("/:id/summary")
  async summary({ params }: HttpContext) {
    const items = await WorkloadItem.query()
      .where("workload_plan_id", params.id)
      .preload("resource");

    const allocationsByWeek = new Map<string, Map<string, number>>();

    for (const item of items) {
      for (const [week, days] of Object.entries(item.weeklyAllocations)) {
        if (!allocationsByWeek.has(week)) {
          allocationsByWeek.set(week, new Map());
        }
        const weekMap = allocationsByWeek.get(week)!;
        const current = weekMap.get(item.resourceId) || 0;
        weekMap.set(item.resourceId, current + days);
      }
    }

    const summary = Array.from(allocationsByWeek.entries()).map(
      ([week, resourceMap]) => ({
        week,
        resources: Array.from(resourceMap.entries()).map(
          ([resourceId, totalDays]) => ({
            resourceId,
            totalDays,
            isOverallocated: totalDays > 5,
          }),
        ),
      }),
    );

    return { summary };
  }
}
```

**app/workload/controllers/workload_items_controller.ts**

```typescript
import { HttpContext } from "@adonisjs/core/http";
import {
  Get,
  Group,
  Middleware,
  Post,
  Put,
  Delete,
  Patch,
} from "@adonisjs-community/girouette";
import { middleware } from "#start/kernel";

import WorkloadItem from "../models/workload_item.js";
import WorkloadItemTransformer from "../transformers/workload_item_transformer.js";
import {
  createWorkloadItemValidator,
  updateWorkloadItemValidator,
  updateAllocationValidator,
} from "../validators/workload_item.js";

@Group({ name: "workload.items", prefix: "/workload-plans/:planId/items" })
@Middleware(middleware.auth())
export default class WorkloadItemsController {
  @Get("/")
  async index({ params, serialize }: HttpContext) {
    const items = await WorkloadItem.query()
      .where("workload_plan_id", params.planId)
      .preload("resource");

    return await serialize(WorkloadItemTransformer.collection(items));
  }

  @Post("/")
  async store({ params, request, serialize }: HttpContext) {
    const payload = await request.validateUsing(createWorkloadItemValidator);
    const item = await WorkloadItem.create({
      ...payload,
      workloadPlanId: params.planId,
    });

    await item.load("resource");
    return await serialize(WorkloadItemTransformer.transform(item));
  }

  @Put("/:id")
  async update({ params, request, serialize }: HttpContext) {
    const item = await WorkloadItem.findOrFail(params.id);
    const payload = await request.validateUsing(updateWorkloadItemValidator);

    item.merge(payload);
    await item.save();

    await item.load("resource");
    return await serialize(WorkloadItemTransformer.transform(item));
  }

  @Delete("/:id")
  async destroy({ params, response }: HttpContext) {
    const item = await WorkloadItem.findOrFail(params.id);
    await item.delete();
    return response.noContent();
  }

  @Patch("/:id/allocations/:week")
  async updateAllocation({ params, request, serialize }: HttpContext) {
    const item = await WorkloadItem.findOrFail(params.id);
    const { days } = await request.validateUsing(updateAllocationValidator);

    item.setAllocationForWeek(params.week, days);
    await item.save();

    await item.load("resource");
    return await serialize(WorkloadItemTransformer.transform(item));
  }
}
```

### Validators

**app/workload/validators/workload_plan.ts**

```typescript
import vine from "@vinejs/vine";

export const createWorkloadPlanValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(3).maxLength(255),
    teamId: vine.string().uuid(),
    periodStart: vine.date(),
    periodEnd: vine.date().afterField("periodStart"),
    deliveryStages: vine.array(vine.string().minLength(1).maxLength(100)),
  }),
);

export const updateWorkloadPlanValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(3).maxLength(255).optional(),
    periodStart: vine.date().optional(),
    periodEnd: vine.date().afterField("periodStart").optional(),
    deliveryStages: vine
      .array(vine.string().minLength(1).maxLength(100))
      .optional(),
  }),
);
```

**app/workload/validators/workload_item.ts**

```typescript
import vine from "@vinejs/vine";

export const createWorkloadItemValidator = vine.compile(
  vine.object({
    project: vine.string().minLength(1).maxLength(255),
    scope: vine.string().minLength(1).maxLength(255),
    task: vine.string().minLength(1).maxLength(255),
    resourceId: vine.string().uuid(),
    estimatedDays: vine.number().min(0),
    weeklyAllocations: vine.object({}).optional(),
    deliveryDates: vine.object({}).optional(),
  }),
);

export const updateWorkloadItemValidator = vine.compile(
  vine.object({
    project: vine.string().minLength(1).maxLength(255).optional(),
    scope: vine.string().minLength(1).maxLength(255).optional(),
    task: vine.string().minLength(1).maxLength(255).optional(),
    resourceId: vine.string().uuid().optional(),
    estimatedDays: vine.number().min(0).optional(),
    weeklyAllocations: vine.object({}).optional(),
    deliveryDates: vine.object({}).optional(),
  }),
);

export const updateAllocationValidator = vine.compile(
  vine.object({
    days: vine.number().min(0).max(5),
  }),
);
```

### Transformers

**app/workload/transformers/workload_plan_transformer.ts**

```typescript
import { BaseTransformer } from "@adonisjs/core/transformers";
import type WorkloadPlan from "../models/workload_plan.js";
import WorkloadItemTransformer from "./workload_item_transformer.js";

export default class WorkloadPlanTransformer extends BaseTransformer<WorkloadPlan> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        "id",
        "name",
        "teamId",
        "periodStart",
        "periodEnd",
        "deliveryStages",
        "createdAt",
        "updatedAt",
      ]),
      weekCount: this.resource.weekCount,
      weeks: this.resource.getWeeks(),
      items: this.include(
        WorkloadItemTransformer.collection(this.resource.items),
      ),
    };
  }
}
```

**app/workload/transformers/workload_item_transformer.ts**

```typescript
import { BaseTransformer } from "@adonisjs/core/transformers";
import type WorkloadItem from "../models/workload_item.js";
import UserTransformer from "#identity/transformers/user_transformer";

export default class WorkloadItemTransformer extends BaseTransformer<WorkloadItem> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        "id",
        "workloadPlanId",
        "project",
        "scope",
        "task",
        "resourceId",
        "estimatedDays",
        "weeklyAllocations",
        "deliveryDates",
        "createdAt",
        "updatedAt",
      ]),
      consumedDays: this.resource.consumedDays,
      progressPercent: this.resource.progressPercent,
      remainingDays: this.resource.remainingDays,
      resource: this.include(UserTransformer.transform(this.resource.resource)),
    };
  }
}
```

---

## ⚛️ Frontend - Composants React

### Structure des routes

```
src/routes/(app)/workload/
├── index.tsx                    # Liste des plans
├── new.tsx                      # Créer un plan
├── $planId.tsx                  # Détails d'un plan (table)
└── $planId.resources.tsx        # Vue charge par intervenant
```

### Composants principaux

```
src/components/workload/
├── workload-plan-list.tsx       # Liste des plans avec actions
├── workload-plan-form.tsx       # Formulaire création/édition plan
├── delivery-stages-config.tsx   # Configuration étapes de livraison
├── workload-table.tsx           # Table principale TanStack
├── workload-table-columns.tsx   # Définition des colonnes
├── editable-text-cell.tsx       # Cellule texte éditable
├── editable-number-cell.tsx     # Cellule nombre éditable
├── week-cell.tsx                # Cellule semaine (0-5j)
├── date-picker-cell.tsx         # Cellule date (étapes livraison)
├── resource-select-cell.tsx     # Cellule sélection intervenant
├── insert-row-button.tsx        # Bouton "+" pour insérer ligne
├── delete-row-button.tsx        # Icône poubelle
├── row-context-menu.tsx         # Menu contextuel (clic droit)
├── workload-summary-row.tsx     # Ligne de total par intervenant
└── use-workload-mutations.ts    # Hooks mutations API
```

### Hooks custom

**src/hooks/use-week-columns.ts**

```typescript
import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import type { Data } from '@opale/api/data'

type WorkloadItem = Data.Workload.WorkloadItem

export function useWeekColumns(weeks: string[]) {
  return useMemo<ColumnDef<WorkloadItem>[]>(() => {
    return weeks.map((week, index) => ({
      id: week,
      header: `S${index + 1}`,
      accessorFn: (row) => row.weeklyAllocations[week] || 0,
      cell: ({ row, getValue }) => (
        <WeekCell
          itemId={row.original.id}
          week={week}
          value={getValue() as number}
          resourceId={row.original.resourceId}
        />
      ),
      size: 80,
      minSize: 60,
      maxSize: 100
    }))
  }, [weeks])
}
```

**src/hooks/use-delivery-columns.ts**

```typescript
import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import type { Data } from '@opale/api/data'

type WorkloadItem = Data.Workload.WorkloadItem

export function useDeliveryColumns(deliveryStages: string[]) {
  return useMemo<ColumnDef<WorkloadItem>[]>(() => {
    return deliveryStages.map((stage) => ({
      id: `delivery_${stage}`,
      header: stage,
      accessorFn: (row) => row.deliveryDates[stage],
      cell: ({ row, getValue }) => (
        <DatePickerCell
          itemId={row.original.id}
          stage={stage}
          value={getValue() as string | undefined}
        />
      ),
      size: 120,
      minSize: 100,
      maxSize: 150
    }))
  }, [deliveryStages])
}
```

**src/hooks/use-workload-mutations.ts**

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { query } from "@/lib/tuyau";

export function useUpdateAllocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      week,
      days,
    }: {
      itemId: string;
      week: string;
      days: number;
    }) => {
      return await query.workload.items
        .updateAllocation({ id: itemId, week })
        .patch({ days });
    },
    onMutate: async ({ itemId, week, days }) => {
      await queryClient.cancelQueries({ queryKey: ["workload-items"] });

      const previousData = queryClient.getQueryData(["workload-items"]);

      queryClient.setQueryData(["workload-items"], (old: any) => {
        return old?.map((item: any) => {
          if (item.id === itemId) {
            return {
              ...item,
              weeklyAllocations: {
                ...item.weeklyAllocations,
                [week]: days,
              },
            };
          }
          return item;
        });
      });

      return { previousData };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["workload-items"], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["workload-items"] });
    },
  });
}

export function useCreateWorkloadItem(planId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      return await query.workload.plans.items({ planId }).post(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workload-items", planId] });
    },
  });
}

export function useDeleteWorkloadItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      return await query.workload.items.delete({ id: itemId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workload-items"] });
    },
  });
}
```

### Composant principal - WorkloadTable

**src/components/workload/workload-table.tsx**

```typescript
import { useMemo } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table'
import type { Data } from '@opale/api/data'

import { useWeekColumns } from '@/hooks/use-week-columns'
import { useDeliveryColumns } from '@/hooks/use-delivery-columns'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

type WorkloadPlan = Data.Workload.WorkloadPlan
type WorkloadItem = Data.Workload.WorkloadItem

interface WorkloadTableProps {
  plan: WorkloadPlan
  items: WorkloadItem[]
}

export function WorkloadTable({ plan, items }: WorkloadTableProps) {
  const weekColumns = useWeekColumns(plan.weeks)
  const deliveryColumns = useDeliveryColumns(plan.deliveryStages)

  const columns = useMemo(() => [
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => <InsertRowButton afterRowId={row.original.id} />,
      size: 40
    },
    {
      id: 'project',
      header: 'Projet',
      accessorKey: 'project',
      cell: ({ row }) => <EditableTextCell itemId={row.original.id} field="project" value={row.original.project} />
    },
    {
      id: 'scope',
      header: 'Scope',
      accessorKey: 'scope',
      cell: ({ row }) => <EditableTextCell itemId={row.original.id} field="scope" value={row.original.scope} />
    },
    {
      id: 'task',
      header: 'Tâche',
      accessorKey: 'task',
      cell: ({ row }) => <EditableTextCell itemId={row.original.id} field="task" value={row.original.task} />
    },
    {
      id: 'estimatedDays',
      header: 'Estimation',
      accessorKey: 'estimatedDays',
      cell: ({ row }) => <EditableNumberCell itemId={row.original.id} field="estimatedDays" value={row.original.estimatedDays} />
    },
    {
      id: 'consumedDays',
      header: 'Conso',
      accessorKey: 'consumedDays',
      cell: ({ getValue }) => <span className="text-muted-foreground">{getValue()}j</span>
    },
    {
      id: 'progressPercent',
      header: 'Avancement',
      accessorKey: 'progressPercent',
      cell: ({ getValue }) => <span className="text-muted-foreground">{getValue()}%</span>
    },
    {
      id: 'remainingDays',
      header: 'Reste',
      accessorKey: 'remainingDays',
      cell: ({ getValue }) => <span className="text-muted-foreground">{getValue()}j</span>
    },
    {
      id: 'resource',
      header: 'Intervenant',
      accessorFn: (row) => row.resource?.fullName,
      cell: ({ row }) => <ResourceSelectCell itemId={row.original.id} resourceId={row.original.resourceId} />
    },
    ...weekColumns,
    ...deliveryColumns,
    {
      id: 'delete',
      header: '',
      cell: ({ row }) => <DeleteRowButton itemId={row.original.id} />,
      size: 40
    }
  ], [weekColumns, deliveryColumns])

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel()
  })

  return (
    <div className="corner-squircle rounded-4xl border overflow-hidden">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} style={{ width: header.getSize() }}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <WorkloadSummaryRow items={items} weeks={plan.weeks} />
    </div>
  )
}
```

---

## 📝 Standards de code

### Nommage explicite (pas de commentaires)

**❌ Mauvais (avec commentaires):**

```typescript
const calc = (a: number, b: number) => {
  return (a / b) * 100;
};
```

**✅ Bon (auto-explicite):**

```typescript
const calculateProgressPercentage = (consumed: number, estimated: number) => {
  return (consumed / estimated) * 100;
};
```

### Structure des fichiers

**Models:** Utiliser mixins `WithPrimaryUuid` et `WithTimestamps`
**Controllers:** Utiliser décorateurs Girouette (`@Get`, `@Post`, etc.)
**Validators:** Utiliser VineJS avec `vine.compile`
**Transformers:** Étendre `BaseTransformer` et utiliser `pick` + `include`

### Design system

Tous les composants ShadcnUI doivent avoir `corner-squircle rounded-4xl`:

```typescript
<Card className="corner-squircle rounded-4xl">
<Button className="corner-squircle rounded-4xl">
<Input className="corner-squircle rounded-md">
```

---

## 🧪 Tests

### Stratégie

**Unitaires (Japa):**

- Models: Computed properties (consumedDays, progressPercent, remainingDays)
- Validators: Validation rules
- Calculs: Formules de charge

**Intégration (Japa):**

- API endpoints: Request/response
- Relations: Preload, cascade delete
- Transactions: Rollback sur erreur

**E2E (Playwright):**

- Création plan de charge
- Édition inline cellules
- Détection sur-allocation
- Navigation entre vues

### Exemples de tests

**tests/unit/workload/workload_item.spec.ts**

```typescript
import { test } from "@japa/runner";
import WorkloadItem from "#workload/models/workload_item";

test.group("WorkloadItem - Computed properties", () => {
  test("consumedDays calculates sum of past weeks", async ({ assert }) => {
    const item = new WorkloadItem();
    item.weeklyAllocations = {
      "2026-W01": 3,
      "2026-W02": 5,
      "2026-W03": 2,
    };

    assert.isNumber(item.consumedDays);
    assert.isAtLeast(item.consumedDays, 0);
  });

  test("progressPercent calculates correctly", async ({ assert }) => {
    const item = new WorkloadItem();
    item.estimatedDays = 50;
    item.weeklyAllocations = { "2026-W01": 10 };

    assert.equal(item.progressPercent, 20);
  });

  test("remainingDays is never negative", async ({ assert }) => {
    const item = new WorkloadItem();
    item.estimatedDays = 10;
    item.weeklyAllocations = { "2026-W01": 15 };

    assert.equal(item.remainingDays, 0);
  });
});
```

**tests/functional/workload/workload_plans.spec.ts**

```typescript
import { test } from "@japa/runner";
import testUtils from "@adonisjs/core/services/test_utils";

test.group("WorkloadPlans API", (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction());

  test("POST /workload-plans creates a plan", async ({ client, assert }) => {
    const response = await client.post("/api/workload-plans").json({
      name: "Plan Q1 2026",
      teamId: "team-uuid",
      periodStart: "2026-01-01",
      periodEnd: "2026-03-31",
      deliveryStages: ["Liv. SFD", "MEP"],
    });

    response.assertStatus(200);
    assert.properties(response.body(), ["id", "name", "weekCount", "weeks"]);
  });

  test("PATCH /workload-items/:id/allocations/:week validates max 5 days", async ({
    client,
  }) => {
    const response = await client
      .patch("/api/workload-items/item-uuid/allocations/2026-W01")
      .json({ days: 6 });

    response.assertStatus(422);
  });
});
```

---

## 🚀 Plan d'implémentation - 6 Slices

### Slice 1: CRUD Plans de charge (opale-199)

**Backend:**

- [ ] Migration `create_workload_plans_table.ts`
- [ ] Model `WorkloadPlan` avec mixins
- [ ] Validator `workload_plan.ts`
- [ ] Transformer `workload_plan_transformer.ts`
- [ ] Controller `workload_plans_controller.ts` (index, store, show, update, destroy)
- [ ] Tests unitaires model
- [ ] Tests intégration API

**Frontend:**

- [ ] Route `/workload` (liste des plans)
- [ ] Route `/workload/new` (création)
- [ ] Composant `WorkloadPlanList`
- [ ] Composant `WorkloadPlanForm`
- [ ] Composant `DeliveryStagesConfig` (configuration étapes)
- [ ] Hook `useWorkloadPlans` (TanStack Query)
- [ ] Tests E2E création plan

**Critères de validation:**

- ✅ Créer un plan avec nom, période, étapes customisables
- ✅ Lister tous les plans
- ✅ Modifier un plan
- ✅ Supprimer un plan
- ✅ Validation: periodEnd > periodStart
- ✅ Tests passent (unitaires + intégration + E2E)

---

### Slice 2: CRUD Items avec colonnes fixes (opale-2if)

**Backend:**

- [ ] Migration `create_workload_items_table.ts`
- [ ] Model `WorkloadItem` avec relations
- [ ] Validator `workload_item.ts`
- [ ] Transformer `workload_item_transformer.ts`
- [ ] Controller `workload_items_controller.ts` (index, store, update, destroy)
- [ ] Tests unitaires model
- [ ] Tests intégration API

**Frontend:**

- [ ] Route `/workload/:planId` (détails plan avec table)
- [ ] Composant `WorkloadTable` (TanStack Table)
- [ ] Colonnes fixes: Projet, Scope, Tâche, Estimation, Intervenant
- [ ] Composant `EditableTextCell`
- [ ] Composant `EditableNumberCell`
- [ ] Composant `ResourceSelectCell`
- [ ] Composant `InsertRowButton` (bouton "+" pour insérer ligne)
- [ ] Composant `DeleteRowButton` (icône poubelle)
- [ ] Composant `RowContextMenu` (clic droit)
- [ ] Hook `useCreateWorkloadItem`
- [ ] Hook `useUpdateWorkloadItem`
- [ ] Hook `useDeleteWorkloadItem`
- [ ] Tests E2E CRUD items

**Critères de validation:**

- ✅ Créer un item avec bouton "+"
- ✅ Éditer inline toutes colonnes fixes
- ✅ Supprimer avec icône poubelle ou clic droit
- ✅ Auto-save avec optimistic updates
- ✅ Sélection intervenant (dropdown users)
- ✅ Tests passent

---

### Slice 3: Granularité hebdomadaire (opale-222)

**Backend:**

- [ ] Endpoint `PATCH /workload-items/:id/allocations/:week`
- [ ] Validator `updateAllocationValidator` (0-5j)
- [ ] Tests validation blocage >5j

**Frontend:**

- [ ] Hook `useWeekColumns` (génération colonnes S1-S26)
- [ ] Composant `WeekCell` (édition inline 0-5j)
- [ ] Virtualisation horizontale (react-virtual)
- [ ] Hook `useUpdateAllocation` (optimistic update)
- [ ] Validation blocage >5j côté client
- [ ] Tests E2E édition allocations

**Critères de validation:**

- ✅ Colonnes S1-S26 générées selon période plan
- ✅ Édition inline avec auto-save
- ✅ Validation bloque saisie >5j
- ✅ Virtualisation fonctionne (scroll fluide)
- ✅ Optimistic updates (feedback immédiat)
- ✅ Tests passent

---

### Slice 4: Calculs automatiques (opale-560)

**Backend:**

- [ ] Computed properties: `consumedDays`, `progressPercent`, `remainingDays`
- [ ] Endpoint `GET /workload-plans/:id/summary` (charge par intervenant)
- [ ] Tests unitaires calculs

**Frontend:**

- [ ] Colonnes Conso, Avancement, Reste (lecture seule)
- [ ] Composant `WorkloadSummaryRow` (ligne de total)
- [ ] Indicateurs visuels (rouge si >5j)
- [ ] Hook `useWorkloadSummary`
- [ ] Tests E2E calculs affichés

**Critères de validation:**

- ✅ Conso = somme semaines passées
- ✅ Avancement = (Conso / Estimation) × 100
- ✅ Reste = Estimation - Conso
- ✅ Ligne de total affiche charge par intervenant
- ✅ Cellules rouges si total semaine >5j
- ✅ Tests passent

---

### Slice 5: Étapes de livraison (opale-hw1)

**Backend:**

- [ ] Validation `delivery_dates` (dates valides)
- [ ] Tests intégration

**Frontend:**

- [ ] Hook `useDeliveryColumns` (colonnes dynamiques)
- [ ] Composant `DatePickerCell`
- [ ] Affichage colonnes étapes à droite de la table
- [ ] Hook `useUpdateDeliveryDate`
- [ ] Tests E2E saisie dates

**Critères de validation:**

- ✅ Colonnes étapes générées selon plan.deliveryStages
- ✅ Édition dates avec DatePicker
- ✅ Auto-save
- ✅ Affichage à droite de la table
- ✅ Tests passent

---

### Slice 6: Vue charge par intervenant (opale-olr)

**Frontend:**

- [ ] Route `/workload/:planId/resources`
- [ ] Composant `ResourceWorkloadView`
- [ ] Tableau par intervenant (tous projets/tâches)
- [ ] Total par semaine
- [ ] Indicateurs sur-allocation
- [ ] Tests E2E navigation

**Critères de validation:**

- ✅ Vue groupée par intervenant
- ✅ Affiche tous projets/tâches de l'intervenant
- ✅ Total par semaine visible
- ✅ Indicateurs rouge si >5j
- ✅ Navigation fluide depuis vue principale
- ✅ Tests passent

---

## 🎯 Features Post-MVP

### 1. Vues et groupage (opale-a73)

- Grouper par projet (hiérarchie expandable)
- Grouper par intervenant
- Filtres: intervenant, projet, période

### 2. Export Excel/PDF (opale-bd0)

- Export Excel (exceljs)
- Export PDF (jspdf)
- Inclure toutes colonnes + formatage

### 3. Templates de plans (opale-6ie)

- Sauvegarder plan comme template
- Créer plan depuis template
- Bibliothèque templates par équipe

### 4. Gestion jours fériés (opale-8il)

- Calendrier configurable jours fériés
- Indicateur dans colonnes (S15 (4j max))
- Ajustement validation

### 5. Notifications sur-allocation (opale-04p)

- Alertes in-app + email
- Sur-allocation détectée
- Retard sur livrable

### 6. Historique et audit log (opale-0nz)

- Table audit_logs
- Tracer toutes modifications
- UI consultation historique

### 7. Graphiques de charge (opale-g9x)

- Bar chart charge par intervenant
- Gantt-like timeline projets
- Heatmap disponibilité

### 8. Collaboration temps réel (opale-csq)

- WebSockets
- Indicateurs de présence
- Gestion conflits édition

### 9. API publique et webhooks (opale-oaj)

- Endpoints publics
- Webhooks événements
- Rate limiting

---

## 📊 Volumétrie et performances

**Scénario typique:**

- 100 lignes (WorkloadItems)
- 26 semaines
- 100 intervenants potentiels
- 3-5 étapes de livraison

**Total cellules:** ~2 600 cellules de granularité + colonnes fixes + étapes = **~3 000 cellules**

**Optimisations:**

- Virtualisation horizontale (react-virtual)
- Optimistic updates (TanStack Query)
- Index DB sur workload_plan_id, resource_id
- Preload relations (resource)

---

## ✅ Checklist avant de commencer

- [x] Valider ce plan avec l'utilisateur
- [ ] Créer une branche `feature/workload-mvp`
- [ ] Commencer par Slice 1 (opale-199)
- [ ] Suivre l'ordre des slices (1 → 2 → 3 → 4 → 5 → 6)
- [ ] Tester chaque slice avant de passer à la suivante
- [ ] Commit après chaque slice validée

---

**Créé le:** 2026-01-01  
**Issues bd:** opale-199, opale-2if, opale-222, opale-560, opale-hw1, opale-olr  
**Approche:** Vertical slicing  
**Tests:** Tous (unitaires + intégration + E2E)
