import { v2 as cloudinary } from 'cloudinary';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  /**
   * Upload an image to Cloudinary
   * @param file The file to upload
   * @returns Promise with the secure URL
   */
  async uploadImage(file: Express.Multer.File): Promise<string> {
    try {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: 'auto' },
          (error, result) => {
            if (error) {
              this.logger.error(`Failed to upload image: ${error.message}`);
              reject(error);
            } else if (!result) {
              reject(new Error('Upload failed: No result returned'));
            } else {
              resolve(result.secure_url);
            }
          }
        );
        
        uploadStream.end(file.buffer);
      });
    } catch (error) {
      this.logger.error(`Unexpected error during upload: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Delete an image from Cloudinary
   * @param publicId The public ID of the image
   * @returns Promise with the deletion result
   */
  async deleteImage(publicId: string): Promise<any> {
    try {
      return await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      this.logger.error(`Failed to delete image: ${error.message}`);
      throw error;
    }
  }
}