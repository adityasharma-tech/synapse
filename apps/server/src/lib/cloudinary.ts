import fs from "fs";
import { v2 as cloudinary, UploadApiOptions } from "cloudinary";
import { env } from "@pkgs/zod-client";
import { logger } from "@pkgs/lib";

cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
});

const uploadDocumentOnCloudinary: (
    f: string,
    options?: UploadApiOptions
) => Promise<string | null> = async (localFilePath, options) => {
    try {
        const uploadResult = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            format: "jpg",
            ...options,
        });

        // delete the document file
        fs.unlinkSync(localFilePath);
        return uploadResult.secure_url;
    } catch (error) {
        logger.error(`Error while uploading image to cloudinary: `);
        logger.error(error);
        fs.unlinkSync(localFilePath);
        return null;
    }
};

export { uploadDocumentOnCloudinary };
