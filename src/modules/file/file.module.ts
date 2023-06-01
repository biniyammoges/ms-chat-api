import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FileEntity } from "./file.entity";
import { FileService } from "./file.service";
import { FileController } from "./file.controller";
import { FileSubscriber } from "./file.subscriber";

@Module({
     imports: [TypeOrmModule.forFeature([FileEntity])],
     controllers: [FileController],
     providers: [FileService, FileSubscriber],
})
export class FileModule { }