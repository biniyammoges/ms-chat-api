import * as path from "path";
import { DataSource, DataSourceOptions } from "typeorm";
import { UserEntity } from "./modules/user/entities/user.entity";
import { FollowerEntity } from "./modules/follower/entities/follower.entity";
import { FileEntity } from "./modules/file/file.entity";

let isTsNode = false;
// https://github.com/TypeStrong/ts-node/issues/846#issuecomment-631828160
// Alternative: https://www.npmjs.com/package/detect-ts-node
// @ts-ignore
if (process[Symbol.for('ts-node.register.instance')]) {
     isTsNode = true;
}

const entities: DataSourceOptions['entities'] = [
     path.join(process.cwd(), '/dist/**/*.entity{.js, .ts}'),
     ...(process.env.NODE_ENV === 'test' ? [UserEntity, FollowerEntity, FileEntity] : []),
     ...(isTsNode ? [path.join(process.cwd(), 'src/**/*.entity{.ts, .js}')] : [])
]

export const ds: DataSourceOptions = {
     type: 'mysql',
     host: process.env.DB_HOST,
     username: process.env.DB_USERNAME,
     port: +process.env.DB_PORT,
     password: process.env.DB_PASSWORD,
     database: process.env.DB_NAME,
     subscribers: [],
     migrations: [],
     logger: 'debug',
     entities,
     synchronize: true
}

export default new DataSource(ds);