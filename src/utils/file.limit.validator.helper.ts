import { BadRequestException } from '@nestjs/common';

const rejectedFileTypes = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime', 
  'video/x-msvideo', 
  'video/x-matroska', 
];

export function validateAdImagesSize(files?: any) {
  for (const file of files) {
    if (file.size > 8 * 1024 * 1024) {
      throw new BadRequestException('Files size must be less than 8MB');
    }

   if (!rejectedFileTypes.includes(files.mimetype)) {
     throw new BadRequestException('Video uploads are not allowed');
   }
  }
}

export function validateProfilePicSize(profilePicture: any) {
  if (profilePicture.size > 3 * 1024 * 1024)
    throw new BadRequestException('Profile picture size must be less than 3MB');

   if (!rejectedFileTypes.includes(profilePicture.mimetype)) {
     throw new BadRequestException('Video uploads are not allowed');
   }
}
