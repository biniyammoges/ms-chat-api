import { registerAs } from "@nestjs/config";
import * as Joi from 'joi'

// global config interface
export interface GlobalConfig {
     nodeEnv: 'dev' | 'test' | 'stage' | 'prod'
}

// schema for confi
const GlobalConfigSchema = Joi.object<GlobalConfig>({
     nodeEnv: Joi.string().valid(...['dev', 'test', 'stage', 'prod']).required()
})

export const globalConfig = registerAs('global', () => {
     const config: Partial<GlobalConfig> = { nodeEnv: 'dev' }

     console.log(`Loading global config for enviroment ${config.nodeEnv}`)

     const result = GlobalConfigSchema.valid(config, { abortEarly: true, allowUnknown: true })

     // if (result.error) {
     //      for (const validation of result.error.details)
     //           console.error('GlobalConfig validation error:', validation.message);

     //      throw new Error('Missing configration options');
     // }

     return config
})