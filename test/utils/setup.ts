import { TestClient } from "./client";

export const setupTestClient = async (): Promise<TestClient> => {
     console.log('Setting up test enviroment')
     const client = new TestClient();
     process.env.NODE_ENV = 'test'
     process.env.CLOUDINARY_FOLDER = 'test_uploads'

     await client.initializeTest()
     await client.loadFixtures()

     return client
}