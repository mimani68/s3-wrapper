
export function toKiloByte(number: number) {
    if ( (Math.round(+number)/1024) > 1000 ) {
        return `${ (Math.round(+number)/(1024*1000)).toFixed(1) } MB`
    } else {
        return `${ (Math.round(+number)/1024).toFixed(1) } KB`
    }
}