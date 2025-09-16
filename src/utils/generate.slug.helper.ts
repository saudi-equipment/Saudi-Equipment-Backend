import slugify from 'slugify';

export function generateSlug(text: string, options?: any): string {
  const defaultOptions = {
    lower: true,
    strict: false,           // keep Arabic letters
    replacement: '_',        // spaces → underscore
    remove: /[*+~.()'"!:@]/g,
    locale: 'ar'
  };

  console.log('generateSlug ==> ', text);
  const finalOptions = { ...defaultOptions, ...options };
  return slugify(text, finalOptions);
}

export function makeArabicSlug(str: string): string {
  let s = str;

  // step 1: lowercase (doesn’t affect Arabic, but normalizes any Latin letters)
  s = s.toLowerCase();

  // step 2: remove unwanted characters (keep Arabic letters, numbers, hashtags, spaces, underscores)
  s = s.replace(/[^\p{Script=Arabic}0-9a-zA-Z#\s_]/gu, " ");

  // step 3: replace spaces with underscores
  s = s.replace(/\s+/g, "_");

  // step 4: collapse multiple underscores
  s = s.replace(/_+/g, "_");

  // step 5: trim underscores
  s = s.replace(/^_+|_+$/g, "");

  return s;
}

export async function generateUniqueSlug(
  title: string,
  adId: string,
  adModel: any,
  excludeId?: string,
): Promise<string> {
  // Generate base slug from title
  const baseSlug = makeArabicSlug(title);

  // Start with the base slug
  let slug = baseSlug;
  let counter = 1;

  // Check if slug exists in database
  while (true) {
    const existingAd = await adModel.findOne({
      slug: slug,
      ...(excludeId && { _id: { $ne: excludeId } }),
    });

    if (!existingAd) {
      // Slug is unique, return it
      return slug;
    }

    // If slug exists, check if it already has a counter pattern
    const existingSlugMatch = existingAd.slug.match(/^(.+)_(\d+)$/);
    if (existingSlugMatch) {
      // Extract the base part and current counter
      const [, basePart, currentCounter] = existingSlugMatch;
      const currentCount = parseInt(currentCounter, 10);
      
      // If the base part matches our base slug, start from the next number
      if (basePart === baseSlug) {
        counter = currentCount + 1;
        slug = `${baseSlug}_${counter}`;
        continue; // Skip the increment at the end
      }
    }else{
      slug = `${baseSlug}_${counter}`;
      counter++;
      continue;
    }
  }
}
