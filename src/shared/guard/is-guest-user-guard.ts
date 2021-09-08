import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { isEmpty } from 'lodash';
import { Observable } from 'rxjs';
import { verify } from 'jsonwebtoken';

import { config } from 'src/config/app-config';

@Injectable()
export class IsGuestUserGuard implements CanActivate {

  constructor() {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return true
  }

}