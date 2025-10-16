/**
 * Simple script to copy the notification sound to the public directory
 * Run this script before building the application
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Source and destination paths
const sourcePath = path.join(
  __dirname,
  "src",
  "assets",
  "audio",
  "notification_tone.mp3"
);
const destDir = path.join(__dirname, "public", "assets", "audio");
const destPath = path.join(destDir, "notification_tone.mp3");

// Create the directory if it doesn't exist
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
  console.log("Created directory:", destDir);
}

// Copy the file
try {
  fs.copyFileSync(sourcePath, destPath);
  console.log("Successfully copied notification sound to public directory");
  console.log("Source:", sourcePath);
  console.log("Destination:", destPath);
} catch (error) {
  console.error("Error copying notification sound file:", error.message);
}
