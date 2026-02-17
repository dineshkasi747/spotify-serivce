
import fs from "fs"

import path from "path"

const structure = [
  ".env",
  "package.json",
  "server.js",
  ".gitignore",
  "README.md",

  "config/db.js",
  "config/cloudinary.js",

  "models/User.js",
  "models/Song.js",
  "models/Playlist.js",
  "models/UserInteraction.js",

  "controllers/authController.js",
  "controllers/songController.js",
  "controllers/playlistController.js",
  "controllers/recommendationController.js",

  "routes/authRoutes.js",
  "routes/songRoutes.js",
  "routes/playlistRoutes.js",
  "routes/recommendationRoutes.js",

  "middleware/authMiddleware.js",
  "middleware/uploadMiddleware.js",

  "utils/mlService.js",

  "seeds/songs200.json",
  "seeds/seed.js",

  "music-files/.gitkeep"
];

function createStructure(baseDir, files) {
  files.forEach((file) => {
    const fullPath = path.join(baseDir, file);
    const dir = path.dirname(fullPath);

    // Create folder if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created folder: ${dir}`);
    }

    // Create file if it doesn't exist
    if (!fs.existsSync(fullPath)) {
      fs.writeFileSync(fullPath, "");
      console.log(`📄 Created file: ${fullPath}`);
    }
  });
}

createStructure(process.cwd(), structure);

console.log("\n✅ Project structure created successfully!");
