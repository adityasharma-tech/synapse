import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import { env } from "zod-client";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

const uploadDocumentOnCloudinary: (
  f: string
) => Promise<string | null> = async (localFilePath: string) => {
  try {
    const uploadResult = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      format: "jpg",
    });

    // delete the document file
    fs.unlinkSync(localFilePath);
    return uploadResult.secure_url;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    return null;
  }
};

export { uploadDocumentOnCloudinary };
