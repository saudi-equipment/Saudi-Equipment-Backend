import { BadRequestException } from '@nestjs/common';
const fileTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

export function validateAdImagesSize(files?: any) {
  for (const file of files) {
    if (file.size > 20 * 1024 * 1024) {
      throw new BadRequestException('Files size must be less than 20MB');
    }

    if (!fileTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Only JPG, JPEG, WebP and PNG images are allowed',
      );
    }
  }
}

export function validateProfilePicSize(profilePicture: any) {
  if (profilePicture.size > 5 * 1024 * 1024)
    throw new BadRequestException('Profile picture size must be less than 5MB');

  if (!fileTypes.includes(profilePicture.mimetype))
    throw new BadRequestException(
      'Only JPG, JPEG, WebP and PNG image are allowed',
    );
}
