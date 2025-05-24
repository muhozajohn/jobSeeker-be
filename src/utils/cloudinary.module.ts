import { Module, Global } from '@nestjs/common';
import { CloudinaryService } from '../utils/cloudinary.service';

@Global()
@Module({
  providers: [CloudinaryService],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}