import { SignInDto } from "src/modules/auth/dtos/signin.dto"
import { TestClient } from "./utils/client"
import { userFixtures } from "./utils/fixtures/user.fixture"
import { setupTestClient } from "./utils/setup"
import { SignUpDto } from "src/modules/auth/dtos/signup.dto"
import { UserDto } from "src/modules/user/dtos/user.dto"
import { JwtResponse } from "src/modules/auth/dtos"

describe('Authentication', () => {
     let client: TestClient

     beforeAll(async () => {
          client = await setupTestClient()
     })
     afterEach(() => client.clearHeaders())
     afterAll(async () => await client.close())

     it('/api/auth/login (POST) - return invalid email or password when tried with wrong credentials', async () => {
          const response = await client.requestApi<SignInDto>('/auth/login', { body: { emailOrUsername: userFixtures.user0.email, password: '123465788' }, method: 'post' })
          expect(response.message).toBe('Invalid email or password')
     })

     it('/api/auth/login (POST) - return access and refresh token when tried with correct credentials', async () => {
          const response = await client.requestApi<SignInDto, JwtResponse>('/auth/login', { body: { emailOrUsername: userFixtures.user0.email, password: '12345678' }, method: 'post' })
          expect(response?.accessToken).toBeDefined()
          expect(response?.refreshToken).toBeDefined()
     })

     it('/api/auth/refresh-access-token (GET) - return new access and refresh token when tried with correct credentials', async () => {
          await client.login({ emailOrUsername: userFixtures.user0.email, password: '12345678' }, true);
          const response = await client.requestApi<any, JwtResponse>('/auth/refresh-access-token')
          expect(response?.accessToken).toBeDefined()
          expect(response?.refreshToken).toBeDefined()
     })

     it('/api/auth/refresh-access-token (GET) - return unauthorized error with out refresh token', async () => {
          const response = await client.requestApi('/auth/refresh-access-token')
          expect(response?.message).toBe('Unauthorized')
     })

     it('/api/auth/signup (POST) - return created user', async () => {
          const response = await client.requestApi<SignUpDto, JwtResponse>('/auth/signup', {
               body: {
                    email: 'binix@gmail.com',
                    firstName: 'binix',
                    lastName: 'm',
                    password: '12345678',
                    username: 'iambinix'
               }, method: 'post'
          })
          expect(response?.accessToken).toBeDefined()
          expect(response?.refreshToken).toBeDefined()
     })

     it('/api/auth/signup (POST) - return error when tried with already existing email', async () => {
          const response = await client.requestApi<SignUpDto>('/auth/signup', {
               body: {
                    email: userFixtures.user0.email,
                    firstName: 'binix',
                    lastName: 'm',
                    password: '12345678',
                    username: "binix"
               }, method: 'post'
          })
          expect(response?.message).toBe('Email or username is already in use, please choose another one')
          expect(response?.statusCode).toBe(400)
     })

     it('/api/auth/signup (POST) - return error when tried with already existing username', async () => {
          const response = await client.requestApi<SignUpDto>('/auth/signup', {
               body: {
                    email: "binix@gg.com",
                    firstName: 'binix',
                    lastName: 'm',
                    password: '12345678',
                    username: userFixtures.user0.username
               }, method: 'post'
          })
          expect(response?.message).toBe('Email or username is already in use, please choose another one')
          expect(response?.statusCode).toBe(400)
     });

     it('/api/auth/me (GET) - return current user', async () => {
          await client.login({ emailOrUsername: userFixtures.user0.email, password: '12345678' });
          const response = await client.requestApi<any, UserDto>('/auth/me',)
          expect(response?.id).toBe(userFixtures.user0.id)
          expect(response?.email).toBe(userFixtures.user0.email)
     })

     it('/api/auth/me (GET) - return unauthorized error with out access token', async () => {
          const response = await client.requestApi('/auth/me')
          expect(response?.message).toBe('Unauthorized')
     })

     it('/api/auth/logout (GET) - response should be OK', async () => {
          await client.login({ emailOrUsername: userFixtures.user0.email, password: '12345678' });
          const response = await client.requestApi('/auth/logout')
          expect(response).toBeDefined()
     })

     it('/api/auth/logout (GET) - return unauthorized error with out access token', async () => {
          const response = await client.requestApi('/auth/logout')
          expect(response?.message).toBe('Unauthorized')
     })
})