import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import mongoose from 'mongoose';
@Module({
  imports: [
    ConfigModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('MONGODB_URL');

        try {
          await mongoose.connect(uri);
          Logger.log('Successfully connected to database');
          mongoose.set('strictPopulate', false);
        } catch (error) {
          Logger.error(`Failed to connect to database: ${error.message}`);
          process.exit(1);
        }
        return { uri };
      },
    }),
  ],
})
export class ConfigurationModule {}
