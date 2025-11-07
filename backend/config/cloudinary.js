import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config(); // load env variables first

// Cloudinary SDK v2 can automatically parse CLOUDINARY_URL environment variable
// Format: cloudinary://api_key:api_secret@cloud_name
const cloudinaryUrl = process.env.CLOUDINARY_URL;

// Alternative: use individual environment variables
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

try {
  if (cloudinaryUrl) {
    // Cloudinary SDK will automatically use CLOUDINARY_URL if it exists
    // But we can also explicitly configure it
    cloudinary.config({
      secure: true,
    });
    console.log("✅ Cloudinary configured from CLOUDINARY_URL");
  } else if (cloudName && apiKey && apiSecret) {
    // Use individual environment variables
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    console.log("✅ Cloudinary configured from individual env variables");
  } else {
    console.error("❌ Cloudinary configuration missing!");
    console.error("Please provide either:");
    console.error("1. CLOUDINARY_URL environment variable");
    console.error("2. Or individual: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET");
    throw new Error("Cloudinary configuration not found. Please check your .env file.");
  }
  
  // Test configuration by checking if cloud_name is set
  const config = cloudinary.config();
  if (!config.cloud_name) {
    throw new Error("Cloudinary cloud_name is not configured");
  }
  console.log(`✅ Cloudinary connected to cloud: ${config.cloud_name}`);
} catch (err) {
  console.error("❌ Cloudinary configuration error:", err.message);
  throw err;
}

export default cloudinary;
