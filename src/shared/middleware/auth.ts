import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { verify } from 'jsonwebtoken';
import { isEmpty } from 'lodash';
import { createClient } from 'redis';

import { config } from 'src/config/app-config';

let onlyUser = [{
  method: ['post'],
  url: '/api/v1/file'
}]

let onlyAdmin = [{
  method: ['delete'],
  url: '/api/v1/file'
},
{
  method: ['get', 'put', 'post', 'delete'],
  url: '/api/v1/admin'
}]

@Injectable()
export class AuthMiddleWare implements NestMiddleware {
  use(req: any, res: any, next: () => void) {

    /*
     *
     * Private user access
     * 
     */
    if (
      onlyUser.some(el => {
        return req.originalUrl.search(new RegExp(el.url, 'i')) >= 0 && el.method.some( o => req.method.search(new RegExp(o, 'i')) >= 0)
      })
    ) {
      if ( config.AUTH_METHOD === 'jwt' ) {
        let tokenString = req.headers.authorization
        tokenString = tokenString?.split(' ')
        let isJWTValid = false
        try {
          verify( tokenString[1] , config.SECRET )
          isJWTValid = true
        } catch (error) {
          isJWTValid = false
        }
        if ( isEmpty(tokenString) )
          return res.sendStatus(HttpStatus.UNAUTHORIZED)
        if (
          isEmpty(tokenString[1]) ||
          !isJWTValid 
          // FIXME: get value form external
          // let salt = redis.get(config.EXTERNAL_REDIS_ADDRES_SALT)
        ) {
          return res.sendStatus(HttpStatus.UNAUTHORIZED)
        }
      } else if ( config.AUTH_METHOD === 'redis' ) {
        let tokenString = req.headers.authorization
        tokenString = tokenString?.split(' ')
        if ( isEmpty(tokenString) ) 
          return res.sendStatus(HttpStatus.UNAUTHORIZED)
        const client = createClient({
          host: 'redis',
          password: 'bnf9cU34naC9'
        });
        return client.keys(tokenString[1], (err, data) => {
          if ( err )
            return res.sendStatus(HttpStatus.UNAUTHORIZED)
          if ( data.length >= 1 ) {
            return next()
          } else {
            return res.sendStatus(HttpStatus.UNAUTHORIZED)
          }
        })
      } else if ( config.AUTH_METHOD === 'public' ) {
        return next()
      }
    }

    /*
     *
     * Only admin
     * 
     */
    if (
      onlyAdmin.some(el => {
        return req.originalUrl.search(new RegExp(el.url, 'i')) >= 0 && el.method.some( o => req.method.search(new RegExp(o, 'i')) >= 0)
      }) &&
      req.headers['secret-access-key'] !== config.MINIO.accessKey
    ) {
      return res.sendStatus(HttpStatus.UNAUTHORIZED)
    }
    next()
  }
}