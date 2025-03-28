import { IsString, IsNotEmpty, IsUrl } from 'class-validator';
export class CreateBannerAdDto {
  @IsNotEmpty()
  @IsString()
  bannerAdName: string;

  @IsNotEmpty()
  @IsUrl()
  bannerAdLink: string;

}
