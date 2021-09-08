import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { isEmpty } from 'lodash';
import { Observable } from 'rxjs';

import { config } from 'src/config/app-config';
import { Role   } from 'src/shared/enum/role.enum';

@Injectable()
export class IsAdminGuard implements CanActivate {

  constructor() {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    // if ( !isEmpty( request.user ) && request.user.role === Role.ADMIN )
    if ( !isEmpty( request.headers ) && request.headers['secret-access-key'] === config.MINIO.accessKey )
      return true
    return false
  }

}