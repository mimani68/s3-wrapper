import { Module } from "@nestjs/common";

import { FileManagerService    } from "src/storage/services/file-manager.service";
import { BucketManagersService } from "src/storage/services/bucket-managers.service";
import { FileScaningService    } from "src/storage/services/file-scaning.service";

import { StorageController } from "src/storage/controllers/storage.controller";
import { AdminController   } from "src/storage/controllers/admin.controller";
import { BucketController  } from "src/storage/controllers/bucket.controller";

@Module({
  controllers: [StorageController, AdminController, BucketController],
  providers: [FileManagerService, BucketManagersService, FileScaningService]
})
export class StorageModule {}
