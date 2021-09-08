import { Instance } from 'chalk'

export const color = new Instance({ level: 2 });

/**
 *
 * @param logLevel
 * @param message
 * @param payload
 */
export function log(logLevel: string, message: string, payload?: any) {
    let slag = ''
    if ( logLevel == LoggingLevel.Info )  slag = color.yellowBright(LoggingLevel.Info)
    if ( logLevel == LoggingLevel.Error ) slag = color.redBright(LoggingLevel.Error)
    console.log(slag + ' ' + message)
    //
    // TODO: send for external log collector
    //
}

export const LoggingLevel = {
    Info: 'INFO',
    Error: 'ERROR'
}
