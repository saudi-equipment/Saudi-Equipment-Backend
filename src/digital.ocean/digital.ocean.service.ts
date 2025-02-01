import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  ObjectCannedACL,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DigitalOceanService {
  private readonly s3Client: S3Client;

  constructor(private readonly configService: ConfigService) {
    const endpoint = configService.get('SPACES_REGION_ENDPOINT');
    const accessKeyId = configService.get('SPACES_ACCESS_KEY');
    const secretAccessKey = configService.get('SPACES_SECRET_KEY');
    const region = configService.get('SPACES_REGION');

    this.s3Client = new S3Client({
      forcePathStyle: true,
      endpoint,
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async uploadFileToSpaces(file: Express.Multer.File): Promise<string> {
    const { originalname, buffer, mimetype } = file;
    const key = `ads/${Date.now()}-${originalname}`;

    const uploadParams = {
      Bucket: this.configService.get('SPACES_BUCKET_NAME'),
      Key: key,
      Body: buffer,
      ContentType: mimetype,
      ACL: ObjectCannedACL.public_read,
    };

    const uploadCommand = new PutObjectCommand(uploadParams);
    await this.s3Client.send(uploadCommand);

    const url = `${this.configService.get('SPACES_REGION_ENDPOINT')}/${uploadParams.Bucket}/${uploadParams.Key}`;
    return url;
  }

  async deleteFilesFromSpaces(fileUrls: string[]) {
    try {
      for (const url of fileUrls) {
        const fileKey = this.extractFileKeyFromUrl(url);

        const deleteParams = {
          Bucket: this.configService.get('SPACES_BUCKET_NAME'),
          Key: fileKey,
        };
        await this.s3Client.send(new DeleteObjectCommand(deleteParams));
      }
    } catch (error) {
      console.error('Error deleting files from Spaces:', error.message);
      throw new Error('Error deleting files');
    }
  }
  
  extractFileKeyFromUrl(url: string): string {
    const urlParts = url.split('/');
    return urlParts.slice(-2).join('/');
  }

  
}
