import { init, Integrations       } from "@sentry/node";

import { config                   } from "src/config/app-config"
import { log, color, LoggingLevel } from "src/utils/log";

/**
 * @returns void
 * @version 1.0.0
 */
export function SentryDriver(): void {
    if (config.SENTRY.enable) {
        init({
            dsn: config.SENTRY.url,
            integrations: [
                new Integrations.Http({
                    tracing: true
                }),
            ],
            tracesSampleRate: config.SENTRY.sample_rate,
            release:          process.env.RELEASE || process.env.npm_package_version,
        });
        setTimeout(() => {
            log(LoggingLevel.Info, 'module ' + color.greenBright('sentry') + ' started');
        }, config.DELAY_SHOW_MODULE_LODING_MESSAGE )
    }
}