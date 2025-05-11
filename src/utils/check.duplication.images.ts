export function extractBaseName(filename: string): string {
  return filename
    .split('-')
    .pop()!
    .split(' ')[0]
    .replace(/\(\d+\)/g, '');
}

export function checkDuplicateImages(
  files: Express.Multer.File[],
  existingImageUrls: string[],
): string[] {
  const newBaseNames = files.map((file) => extractBaseName(file.originalname));

  return newBaseNames.filter((newName) =>
    existingImageUrls.some((url) => {
      const urlFilename = url.split('/').pop()!;
      const existingBaseName = extractBaseName(urlFilename);
      return existingBaseName === newName;
    }),
  );
}
