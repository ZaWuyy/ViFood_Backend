import cloudinary from '../config/cloudinaryConfig.js';
import fs from 'fs/promises'; // Sử dụng cho việc xử lý file tạm

export const chunkUpload = async (filePath, folder, publicId) => {
  const chunkSize = 5 * 1024 * 1024; // 5MB mỗi chunk
  const fileBuffer = await fs.readFile(filePath);
  const totalChunks = Math.ceil(fileBuffer.length / chunkSize);

  let uploadResponse;
  for (let i = 0; i < totalChunks; i++) {
    const chunk = fileBuffer.slice(i * chunkSize, (i + 1) * chunkSize);

    uploadResponse = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          public_id: `${publicId}_part${i + 1}`,
          chunk_size: chunkSize,
        },
        (error, result) => {
          if (error) return reject(new Error(`Failed to upload chunk: ${error.message}`));
          resolve(result);
        }
      );

      uploadStream.write(chunk);
      uploadStream.end();
    });
  }

  return uploadResponse; // Trả về kết quả của chunk cuối cùng
};
