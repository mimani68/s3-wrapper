import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { isEmpty } from 'lodash';
import { Observable } from 'rxjs';
import { verify } from 'jsonwebtoken';

import { config } from 'src/config/app-config';
import { Role   } from 'src/shared/enum/role.enum';

@Injectable()
export class IsUserGuard implements CanActivate {

  constructor() {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    // 
    // R O L E - B A S E
    // 
    // if ( !isEmpty( request.user ) && request.user.role === Role.USER )
    // 
    // T O K E N
    // 
    if ( isEmpty(request.headers.authorization) )
      return false
    let tokenString = request.headers.authorization
    tokenString = tokenString.split(' ')
    if ( isEmpty(tokenString[1]) )
      return false
    let token = verify( tokenString[1] , config.SECRET )
    if ( isEmpty(token) )
      return false
    return true
    
  }

}