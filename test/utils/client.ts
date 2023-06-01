import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AppModule } from "../../src/app.module";
import { AuthService } from "../../src/modules/auth/services/auth.service";
import * as request from "supertest";
import { TypeOrmFixtureService } from "./service/fixture.service";
import { collect } from "typeorm-fixture-builder";
import { fixtures } from "./fixtures";
import { SignInDto } from "src/modules/auth/dtos/signin.dto";
import { userFixtures } from "./fixtures/user.fixture";

type httpMethods = 'get' | 'post' | 'put' | 'delete'

interface RequestOpts<BodyT> {
     method?: httpMethods
     headers?: Record<string, any>;
     body?: BodyT;
     uploads?: { field: string, path: string }[];
}

export class TestClient {
     protected defaultHeaders: Record<string, any> = {}
     protected defaultCookies: Record<string, any> = {}
     protected nestApp: INestApplication
     protected testAgent: request.SuperAgentTest
     private authService: AuthService

     async initializeTest() {
          const module = await Test.createTestingModule({
               imports: [AppModule],
               providers: [TypeOrmFixtureService]
          }).compile()
          this.nestApp = await module.createNestApplication()

          this.authService = this.nestApp.get(AuthService)
          await this.nestApp.init();
          this.resetTestAgent()
     }

     get app() {
          return this.nestApp || null
     }

     async resetTestAgent() {
          this.testAgent = request.agent(this.nestApp.getHttpServer());
     }

     async close() {
          this.nestApp.close()
     }

     async login(loginDto: SignInDto = { emailOrUsername: userFixtures.user0.email, password: "12345678" }, isRefresh = false) {
          try {
               const tokens = await this.authService.signInLocal(loginDto);
               this.defaultHeaders = { ...this.defaultHeaders, authorization: `Bearer ${isRefresh ? tokens.refreshToken : tokens.accessToken}` }
          } catch (err) {
               console.log(err)
               throw err
          }
     }

     async loadFixtures() {
          const typeormFixtureService = await this.nestApp.get(TypeOrmFixtureService);
          await typeormFixtureService.installFixtures(collect(fixtures));
     }

     clearHeaders() {
          this.defaultHeaders = {}
     }

     async requestApi<BodyT = any, ResT = any>(endpoint: string, opts: RequestOpts<BodyT> = { method: 'get', }) {
          const req = this.testAgent[opts.method](endpoint).set({
               headers: { ...this.defaultHeaders, ...opts.headers },
               ...this.defaultHeaders,
               ...opts.headers
          })

          if (opts.uploads && opts.uploads.length) {
               for (const upload of opts.uploads) {
                    req.attach(upload.field, upload.path)
               }
          }

          let res: request.Response;

          if (opts.body) {
               res = await req.send(opts.body as string)
          } else {
               res = await req;
          }

          return res.body as ResT;
     }
}