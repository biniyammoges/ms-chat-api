import { hashSync } from "bcrypt";
import { UserEntity } from "../../../src/modules/user/entities/user.entity";
import { fixture } from "typeorm-fixture-builder";

export const userFixtures = {
     user0: fixture(UserEntity, {
          id: "051ee4bc-df0f-494a-961b-0591f8d6694e",
          firstName: 'Biniyam',
          lastName: "Moges",
          email: "bini@gmail.com",
          password: hashSync('12345678', 10),
          username: "bini_gar",
          bio: "Looking for better job",
          phone: "+251955306564"
     }),
     user1: fixture(UserEntity, {
          id: "85aceae5-b868-47de-8e19-44c6e70688b0",
          firstName: 'john',
          lastName: "doe",
          email: "john@gmail.com",
          password: hashSync('12345678', 10),
          username: "iamjohny",
          bio: "Full stack develper",
          phone: "+251965874548"
     }),
     user2: fixture(UserEntity, {
          id: "1f4cd8b4-37e5-4079-a132-dc5addaa9555",
          firstName: 'test',
          lastName: "user",
          email: "test@gmail.com",
          password: hashSync('12345678', 10),
          username: "testuser",
          bio: "Full stack Test User",
          phone: "+251965874543"
     }),
}