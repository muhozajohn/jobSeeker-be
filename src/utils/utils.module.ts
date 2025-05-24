import { Module, Global } from '@nestjs/common';
import { ErrorHandlerService } from './error.utils';
import { CloudinaryService } from './cloudinary.service';

@Global()
@Module({
  providers: [ErrorHandlerService, CloudinaryService],
  exports: [ErrorHandlerService, CloudinaryService],
})
export class UtilsModule {}