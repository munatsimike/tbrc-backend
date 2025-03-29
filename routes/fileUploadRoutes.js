import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import AWS from "aws-sdk";
import { config } from "dotenv";
import rateLimit from "express-rate-limit";

config();



const router = express.Router();
const spacesEndpoint = new AWS.Endpoint(process.env.DO_SPACES_ENDPOINT);
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.DO_SPACES_ACCESS_KEY,
  secretAccessKey: process.env.DO_SPACES_SECRET_KEY,
  signatureVersion: "v4", // Ensure you are using the correct signing method
});

router.get("/generate-presigned-url", authMiddleware, (req, res) => {
  const { fileName, fileType } = req.query;

  const params = {
    Bucket: "tbrc.app", // Replace with your bucket name
    Key: fileName,
    Expires: 60,
    ContentType: fileType,
    ACL: "public-read",
  };

  s3.getSignedUrl("putObject", params, (err, url) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ url });
  });
});

// Rate limiter middleware to limit requests to the public API
const profilePicUploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

// Public API for profile picture upload without authentication
router.get("/upload-profile-pic", profilePicUploadLimiter, (req, res) => {
  const { fileName, fileType } = req.query;
  console.log(fileName, fileType);
  // Validate file type (e.g., only allow image files)
  const allowedFileTypes = ["image/jpeg", "image/png", "image/gif"];
  if (!allowedFileTypes.includes(fileType)) {
    return res.status(400).json({ error: "Invalid file type." });
  }

  // Validate file name (e.g., ensure it has a valid extension)
  const fileExtension = fileName.split('.').pop();
  const allowedExtensions = ["jpg", "jpeg", "png", "gif"];
  if (!allowedExtensions.includes(fileExtension)) {
    return res.status(400).json({ error: "Invalid file extension." });
  }

  const params = {
    Bucket: "tbrc.app", // Replace with your bucket name
    Key: `profile-pics/${fileName}`, // Store profile pictures in a specific folder
    Expires: 60,
    ContentType: fileType,
    ACL: "public-read",
  };

  s3.getSignedUrl("putObject", params, (err, url) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ url });
  });
});
export default router;
