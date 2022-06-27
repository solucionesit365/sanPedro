import { NestFactory } from '@nestjs/core';
const express = require('express');
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: {
    origin: true,
    credentials: true
  }});
  // app.enableCors();
  app.use(express.json({limit: '20mb'}));
  await app.listen(3001);
}
bootstrap();

// if (process.env.npm_lifecycle_event == 'start:dev') {
//   console.log("AWWWWWWWWWWWWWWWWWWW YEAH");
// } else if (process.env.npm_lifecycle_event == 'start:prod') {
//   console.log("LOOOOOOOOOOL YEAH");
// }
