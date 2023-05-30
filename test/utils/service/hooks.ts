import { getEntityManagerToken } from "@nestjs/typeorm";
import { TestClient } from "../client";
import { EntityManager } from "typeorm";
import { setupTestClient } from "../setup";

export const useTransaction = async (opts: { client: () => TestClient, before: 'each' | 'all' }) => {
     const beforeFunc = opts.before === 'each' ? beforeEach : beforeAll
     const afterFunc = opts.before === 'each' ? afterEach : afterAll

     beforeFunc(async () => {
          const em = opts.client()?.app?.get(getEntityManagerToken()) as EntityManager
          await em?.queryRunner?.startTransaction()
     })

     afterFunc(async () => {
          const em = opts.client()?.app?.get(getEntityManagerToken()) as EntityManager
          await em?.queryRunner?.rollbackTransaction()
     })
}

export const useClient = async (opts: { beforeAll: (client: TestClient) => void }) => {
     let testClient: TestClient;

     beforeAll(async () => {
          testClient = await setupTestClient();
          await opts?.beforeAll(testClient);
     })

     afterEach(() => testClient?.clearHeaders())

     afterAll(async () => {
          await testClient?.close()
     })

     return () => testClient
}