import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule    } from '@nestjs/config';

import { AppService             } from './app.service';
import { AppController          } from './app.controller';
import { StorageModule          } from './storage/storage.module';
import { BucketManagersService  } from './storage/services/bucket-managers.service';
import { IsUserGuard            } from './shared/guard/is-user-guard';
import { IsAdminGuard           } from './shared/guard/is-admin-guard';
import { AuthMiddleWare         } from './shared/middleware/auth';
import { WhiteList              } from './shared/middleware/whiteList';

@Module({
  imports: [
    ConfigModule.forRoot(),
    // TypeOrmModule.forRoot({
    //   type     : 'postgres',
    //   host     : process.env.DB_HOST     || 'none',
    //   port     : +process.env.DB_PORT    || 12,
    //   username : process.env.DB_USERNAME || 'none',
    //   password : process.env.DB_PASSWORD || 'none',
    //   database : process.env.DB_NAME,
    //   entities: [
    //     UserEntity, VerificationCodeEntity,
    //     TokenEntity, ApplicationSettingEntity
    //   ],
    //   synchronize: true,
    // }),
    StorageModule
  ],
  controllers: [AppController],
  providers:   [AppService, BucketManagersService, IsUserGuard, IsAdminGuard ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleWare, WhiteList)
      .forRoutes({ path: '/**', method: RequestMethod.ALL });
  }
}
