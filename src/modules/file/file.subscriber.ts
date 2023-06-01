import { EventSubscriber, EntitySubscriberInterface, RemoveEvent, DataSource, } from "typeorm";
import { FileEntity } from "./file.entity";
import { FileService } from "./file.service";
import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";

@Injectable()
@EventSubscriber()
export class FileSubscriber implements EntitySubscriberInterface<FileEntity> {
     constructor(private fileService: FileService, @InjectDataSource() private ds: DataSource) {
          ds.subscribers.push(this)
     }

     listenTo(): string | Function {
          return FileEntity
     }

     beforeRemove(event: RemoveEvent<FileEntity>): void | Promise<any> {
          if (event.entity instanceof FileEntity) {
               this.fileService.destroyFileFromCloud(event.entity.path)
          }
     }
}