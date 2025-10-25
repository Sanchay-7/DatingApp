import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config(); // load env variables first

// Parse CLOUDINARY_URL manually
const cloudinaryUrl = process.env.CLOUDINARY_URL;

if (!cloudinaryUrl) {
  throw new Error("CLOUDINARY_URL not found in .env");
}

// Cloudinary SDK can parse it
cloudinary.config({
  secure: true,
  cloud_name: cloudinaryUrl.split("@")[1],        // take cloud name after @
  api_key: cloudinaryUrl.split("://")[1].split(":")[0],   // extract api_key
  api_secret: cloudinaryUrl.split(":")[2].split("@")[0]   // extract api_secret
});

export default cloudinary;
