import { Controller, Get, Res, Query } from '@nestjs/common';
import { Response } from 'express';
import * as path from 'path';

@Controller('.well-known')
export class UniversalLinksController {
  
  @Get('apple-app-site-association')
  serveAppleAppSiteAssociation(@Res() res: Response) {
    res.setHeader('Content-Type', 'application/json');
    res.sendFile(path.join(__dirname, '../../public/.well-known/apple-app-site-association'));
  }

  @Get('assetlinks.json')
  serveAndroidAssetLinks(@Res() res: Response) {
    res.setHeader('Content-Type', 'application/json');
    res.sendFile(path.join(__dirname, '../../public/.well-known/assetlinks.json'));
  }

  @Get('deeplink')
  handleWebRedirect(@Res() res: Response, @Query('target') target: string) {
    const androidLink = `intent://${target}#Intent;scheme=https;package=com.yourapp;end;`;
    const iosLink = `yourapp://app/${target}`;
    const webLink = `https://yourweb.com/${target}`;

    const html = `
      <html>
        <head><meta http-equiv="refresh" content="0;url=${webLink}" /></head>
        <body>
          <script>
            setTimeout(() => { window.location = "${iosLink}" }, 1000);
            setTimeout(() => { window.location = "${androidLink}" }, 2000);
          </script>
        </body>
      </html>`;
    
    res.send(html);
  }
}
