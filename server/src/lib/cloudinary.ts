import fs from "fs"
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!
})

const uploadDocumentOnCloudinary: (f: string)=>Promise<string | null> = async (localFilePath: string) => {
    try {
        const uploadResult = await cloudinary.uploader
            .upload(
                localFilePath,
                {
                    resource_type: "auto",
                    format: "jpg"
                }
            )
        
        fs.unlinkSync(localFilePath);
        return uploadResult.secure_url
    } catch (error) {
        fs.unlinkSync(localFilePath);
        return null;
    }
}

export {uploadDocumentOnCloudinary}