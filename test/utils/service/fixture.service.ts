import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { install } from 'typeorm-fixture-builder'

@Injectable()
export class TypeOrmFixtureService {
     constructor(@InjectDataSource() private ds: DataSource) { }

     async installFixtures(fixtures: unknown[]) {
          try {
               // clean test database before inserting fixture
               const entities = this.ds.manager.connection.entityMetadatas;

               for (const e of entities) {
                    await this.ds.query(`DELETE FROM ${e.tableName} WHERE id != "1";`)
               }

               await install(this.ds, fixtures);
          } catch (err) {
               throw err;
          }
     }
}