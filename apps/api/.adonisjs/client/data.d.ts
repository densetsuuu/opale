/// <reference path="./manifest.d.ts" />
import type { InferData, InferVariants } from '@adonisjs/core/types/transformers'
import type IdentityUserTransformer from '#app/identity/transformers/user_transformer'
import type WorkloadWorkloadItemTransformer from '#app/workload/transformers/workload_item_transformer'
import type WorkloadWorkloadPlanTransformer from '#app/workload/transformers/workload_plan_transformer'

export namespace Data {
  export namespace Identity {
    export type User = InferData<IdentityUserTransformer>
    export namespace User {
      export type Variants = InferVariants<IdentityUserTransformer>
    }
  }
  export namespace Workload {
    export type WorkloadItem = InferData<WorkloadWorkloadItemTransformer>
    export namespace WorkloadItem {
      export type Variants = InferVariants<WorkloadWorkloadItemTransformer>
    }
    export type WorkloadPlan = InferData<WorkloadWorkloadPlanTransformer>
    export namespace WorkloadPlan {
      export type Variants = InferVariants<WorkloadWorkloadPlanTransformer>
    }
  }
}
