import { ApiBearerAuth } from '@nestjs/swagger'

export const SWAGGER_BEARER_AUTH = 'access-token'

/** Marca endpoint(s) como protegidos por JWT na documentação OpenAPI (Swagger). */
export const ApiProtectedInDocs = () => ApiBearerAuth(SWAGGER_BEARER_AUTH)
