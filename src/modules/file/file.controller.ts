import { BadRequestException, Controller, Delete, Param, Post, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/at.guard";
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express'
import { FileService } from "./file.service";
import { GetUser } from "../../shared";
import { FileEntity } from "./file.entity";

@Controller()
@UseGuards(JwtAuthGuard)
export class FileController {
     constructor(private fileService: FileService) { }

     @Post('upload/image')
     @UseInterceptors(FileInterceptor('file', {
          fileFilter(_req, file, callback) {
               if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
                    return callback(new Error('Only image files are allowed!'), false);
               }
               callback(null, true);
          },
     }))
     uploadImage(@UploadedFile() file: Express.Multer.File, @GetUser('id') creatorId: string) {
          const fileName = `${file.originalname}-${Date.now()}`
          return this.fileService.upload({ ...file, originalname: fileName }, creatorId)
     }

     @Post('upload/images')
     @UseInterceptors(AnyFilesInterceptor({
          fileFilter(_req, file, callback) {
               if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
                    return callback(new BadRequestException('Only image files are allowed!'), false);
               }
               callback(null, true);
          },
     }))
     async uploadMultipleImages(
          @UploadedFiles() files: Express.Multer.File[],
          @GetUser('id') creatorId: string) {

          return Promise.all(files.reduce<Promise<FileEntity>[]>((all, file) => {
               return [
                    ...all,
                    this.fileService.upload({
                         ...file,
                         originalname: `${file.originalname.substring(0, file.originalname.lastIndexOf('.'))}-${Date.now()}`
                    }, creatorId)
               ]
          }, []))
     }

     @Delete('uploads/:fileId')
     async deleteFile(@GetUser('id') creatorId: string, @Param('fileId') fileId: string) {
          return this.fileService.deleteFile(creatorId, fileId);
     }
}