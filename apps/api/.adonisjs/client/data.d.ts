/// <reference path="./manifest.d.ts" />
import type { InferData, InferVariants } from '@adonisjs/core/types/transformers'
import type IdentityUserTransformer from '#app/identity/transformers/user_transformer'

export namespace Data {
  export namespace Identity {
    export type User = InferData<IdentityUserTransformer>
    export namespace User {
      export type Variants = InferVariants<IdentityUserTransformer>
    }
  }
}
