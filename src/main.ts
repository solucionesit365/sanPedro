import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: {
    origin: true,
    credentials: true
  }});
  // app.enableCors();
  await app.listen(3001);
}
bootstrap();

// if (process.env.npm_lifecycle_event == 'start:dev') {
//   console.log("AWWWWWWWWWWWWWWWWWWW YEAH");
// } else if (process.env.npm_lifecycle_event == 'start:prod') {
//   console.log("LOOOOOOOOOOL YEAH");
// }
