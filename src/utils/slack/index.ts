import { App                      } from '@slack/bolt'

import { config                   } from "src/config/app-config"
import { log, color, LoggingLevel } from "src/utils/log";

export function SlackBotDriver() {
    if ( config.SLACK.enable ) {
        const app = new App({
            signingSecret: config.SLACK.secret,
            token: config.SLACK.bot_token,
        });
        
        (async () => {
            await app.start(+config.SLACK.bot_port);
        
            setTimeout(() => {
                log(LoggingLevel.Info, 'module ' + color.greenBright('slack') + ' started');
            }, config.DELAY_SHOW_MODULE_LODING_MESSAGE);
        })();
    }
}
