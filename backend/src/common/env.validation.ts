import { plainToInstance } from 'class-transformer'
import { IsEnum, IsInt, IsOptional, IsString, IsUrl, validateSync } from 'class-validator'

export enum NodeEnv {
	Development = 'development',
	Production = 'production',
	Test = 'test',
}

export class EnvironmentVariables {
	@IsOptional()
	@IsEnum(NodeEnv)
	NODE_ENV: NodeEnv = NodeEnv.Development

	@IsInt()
	PORT: number = 3001

	@IsString()
	MONGODB_URI: string = 'mongodb://localhost/bolao'

	@IsString()
	AUTH_SECRET!: string

	@IsString()
	GOOGLE_CLIENT_ID!: string

	@IsString()
	JWT_EXPIRES_IN: string = '30d'

	@IsUrl({ require_tld: false })
	RESULTADOS_API_URL!: string
}

export function validateEnv(config: Record<string, unknown>): EnvironmentVariables {
	const validated = plainToInstance(EnvironmentVariables, config, {
		enableImplicitConversion: true,
	})

	const errors = validateSync(validated, { skipMissingProperties: false })
	if (errors.length > 0) {
		throw new Error(`Invalid environment variables:\n${errors.toString()}`)
	}
	return validated
}
