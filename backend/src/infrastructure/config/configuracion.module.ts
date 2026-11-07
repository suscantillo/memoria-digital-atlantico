import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { esquemaConfiguracion } from './configuracion';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      validationSchema: esquemaConfiguracion,
      validationOptions: { abortEarly: false },
    }),
  ],
})
export class ConfiguracionModule {}
