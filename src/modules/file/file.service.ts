import { Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary'
import { EntityManager } from "typeorm";
import { FileEntity } from "./file.entity";
import { Readable } from "stream";

@Injectable()
export class FileService {
     private logger = new Logger(FileService.name);

     constructor(@InjectEntityManager() private em: EntityManager) {
          cloudinary.config({
               cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
               api_key: process.env.CLOUDINARY_API_KEY,
               api_secret: process.env.CLOUDINARY_API_SECRET
          })
     }

     private async uploadBuffer(buffer: Buffer): Promise<UploadApiResponse> {
          return new Promise((resolve, reject) => {
               const uploadStream = cloudinary.uploader.upload_stream({
                    folder: process.env.CLOUDINARY_FOLDER || 'uploads'
               }, (err, res) => {
                    if (res) resolve(res)
                    else reject(err)
               })

               Readable.from(buffer).pipe(uploadStream)
          })
     }

     async upload(file: Express.Multer.File, creatorId: string): Promise<FileEntity> {
          try {
               this.logger.debug("uplpoading file to cloudinary")
               const res = await this.uploadBuffer(file.buffer)
               this.logger.debug("File Uploaded to cloudinary")

               return this.em.save(this.em.create(FileEntity, {
                    name: file.originalname,
                    creatorId: creatorId,
                    size: res.bytes,
                    path: res.public_id,
                    url: res.url,
                    privateUrl: res.secure_url,
                    type: res.type,
               }))
          } catch (err) {
               this.logger.error(err)
               throw new InternalServerErrorException(err.message || 'Something went wrong with upload')
          }
     }

     /**
      * takes fileId and creatorId then delete it from db
      * 
      * @param {string} creatorId - file creator Id
      * @param {string} fileId - file entity id
      * @returns {DeleteResult} - returns delete result of file entity
      */
     async deleteFile(creatorId: string, fileId: string,) {
          const file = await this.em.findOne(FileEntity, { where: { id: fileId, creatorId } });
          if (!file) {
               throw new NotFoundException('File Not Found')
          }

          return file.remove()
     }

     async destroyFileFromCloud(publicId: string) {
          return cloudinary.uploader.destroy(publicId)
     }
}