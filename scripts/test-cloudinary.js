/**
 * Test Cloudinary credentials
 * Run with: node scripts/test-cloudinary.js
 */

require("dotenv").config({ path: ".env.local" });
const { v2: cloudinary } = require("cloudinary");

console.log("Testing Cloudinary credentials...\n");

// Check environment variables
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

console.log("Environment variables:");
console.log("  CLOUDINARY_CLOUD_NAME:", cloudName ? "✓ Set" : "✗ Missing");
console.log("  CLOUDINARY_API_KEY:", apiKey ? "✓ Set" : "✗ Missing");
console.log("  CLOUDINARY_API_SECRET:", apiSecret ? "✓ Set" : "✗ Missing");
console.log();

if (!cloudName || !apiKey || !apiSecret) {
  console.error("❌ Missing required environment variables");
  process.exit(1);
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

console.log("Configuration:");
console.log("  Cloud Name:", cloudName);
console.log("  API Key:", apiKey);
console.log("  API Secret:", apiSecret.substring(0, 4) + "***");
console.log();

// Test API connection
console.log("Testing API connection...");

cloudinary.api
  .ping()
  .then((result) => {
    console.log("✅ Success! Cloudinary credentials are valid");
    console.log("Response:", result);
  })
  .catch((error) => {
    console.error("❌ Failed to connect to Cloudinary");
    console.error("Error:", error.message);
    if (error.error) {
      console.error("Details:", error.error);
    }
    process.exit(1);
  });
