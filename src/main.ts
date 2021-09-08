import { NestFactory    } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import * as timeout       from "connect-timeout";

import { config         } from "./config/app-config"
import { AppModule      } from "./app.module";
import { SentryDriver   } from "./utils/sentry";
import { NestApmDriver  } from "./utils/apm";
import { SwaggerDriver  } from "./utils/swagger";
import { SlackBotDriver } from "./utils/slack";
import { callSetupApiEndPoint } from "./utils/setup/setup-system";


/**
 * 
 * @description luancher of app
 * @version 1.0.0
 */
async function bootstrap() { 

  /**
   * 
   * Nest launcher
   * 
   */
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix(config.APPLICATION_GLOBAL_PREFIX)

  /**
   * 
   * Delay for Db connection
   * 
   */
  app.use(timeout(`${ config.WAIT_UNTIL_DB_BEING_REACHABLE }`));
  app.useGlobalPipes(
    new ValidationPipe({
      validationError: {
        target: false,
        value: false
      },
      dismissDefaultMessages: true, 
    }),
  );

  /**
   * 
   * CORS
   * 
   */
  app.enableCors({ origin: "*" })

  /**
   * 
   * SWAGGER driver
   * 
   */
  SwaggerDriver(app)

  /**
   * 
   * SENTRY driver
   * 
   */
  SentryDriver();

  /**
   * 
   * Elastic APM driver
   * 
   */
  NestApmDriver();
  
  /**
   * 
   * Slack Bot driver
   * 
   */
  SlackBotDriver();

  /**
   * 
   * Setup server
   * 
   */
  callSetupApiEndPoint(config.MINIO.main_bucket_title, config.MINIO.setup_delay);
    
  /**
   * 
   * Start listeting
   * 
   */
  await app.listen(config.PORT);
}

/**
 * 
 * Start project
 * 
 */
bootstrap();
