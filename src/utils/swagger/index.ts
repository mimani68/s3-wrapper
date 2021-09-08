import { SwaggerModule, DocumentBuilder, SwaggerDocumentOptions } from "@nestjs/swagger";
import { config                         } from "src/config/app-config"
import { log, color, LoggingLevel       } from "src/utils/log";

/**
 * @param  {any} app
 * @returns void
 * @version 1.0.0
 */
export function SwaggerDriver(app: any): void {
    if ( config.SWAGGER.enable ) {
        const options = new DocumentBuilder()
            .addBearerAuth(
                { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
                'authorization',
            )
            // .addBearerAuth()
            // .addServer(config.SWAGGER.urlPath, "version 1")
            .setContact("Mahdi Imani", "https://www.linkedin.com/in/mehdi-imani-5220b894/?lipi=urn%3Ali%3Apage%3Ad_flagship3_feed%3BpNt95aa2R0qmdivSU9iLRw%3D%3D", "imani.mahdi@gmail.com")
            .setTitle("Storage Service")
            .setDescription("The file manager consists of an image manipulator, statics and ...")
            .setVersion("1.0")
            // .addTag("authenticate")
            .addTag("file")
            // .addTag("users")
            .addTag("app")
            .build();
        const document = SwaggerModule.createDocument(app, options);
        SwaggerModule.setup(config.SWAGGER.urlPath, app, document);
        setTimeout(() => {
            log(LoggingLevel.Info, 'module ' + color.greenBright('swagger') + ' started');
        }, config.DELAY_SHOW_MODULE_LODING_MESSAGE);
    }
}