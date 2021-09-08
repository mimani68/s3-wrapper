import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { whiteList } from 'src/config/app-config';

@Injectable()
export class WhiteList implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    let userIp = req.headers['x-real-ip']
    if ( req.method === 'GET' ) {
      return next()
    } if ( whiteList.some(el => el === userIp) && ['POST', 'PUT', 'PATCH', 'DELETE'].some(el => el === req.method)) {
      return next()
    } else {
      return res.status(HttpStatus.UNAUTHORIZED)
        .json({
          message: 'Your IP (' + userIp + ') is not in whiteList!'
        })
    }
  }
}