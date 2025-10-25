import dotenv from "dotenv";
dotenv.config(); // ensure env loaded first

import cloudinary from "./config/cloudinary.js";

const testUpload = async () => {
  try {
    const result = await cloudinary.uploader.upload(
      "https://dummyimage.com/200x200/000/fff.png&text=Test",
      { folder: "test" }
    );
    console.log("✅ Cloudinary connected! Uploaded URL:", result.secure_url);
  } catch (err) {
    console.error("❌ Cloudinary connection failed:", err);
  }
};

testUpload();
