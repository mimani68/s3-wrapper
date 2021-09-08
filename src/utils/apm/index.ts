import { start                    } from "elastic-apm-node"

import { config                   } from "src/config/app-config"
import { log, color, LoggingLevel } from "src/utils/log";

/**
 * @returns void
 * @version 1.0.0
 */
export function NestApmDriver(): void {
    if ( config.APM.enable ) {
        start({
            serviceName: config.APM.serviceName,
            secretToken: config.APM.secretToken,
            apiKey:      config.APM.apiKey,
            serverUrl:   config.APM.serverUrl,
        })
        setTimeout(() => {
            log(LoggingLevel.Info, 'module ' + color.greenBright('elastic apm') + ' started');
        }, config.DELAY_SHOW_MODULE_LODING_MESSAGE);
    }
}