const express = require("express");
const router = express.Router();
const storageController = require("../controller/storage.controller");
const multer = require("multer");
const multerS3 = require("multer-s3");
const s3 = require("../config/s3");

// const upload = multer({
//   storage: multerS3({
//     s3,
//     bucket: process.env.S3_BUCKET_NAME,
//     metadata: function (req, file, cb) {
//       cb(null, { fieldName: file.fieldname });
//     },
//     key: function (req, file, cb) {
//       cb(null, Date.now().toString());
//     },
//   }),
// });
const upload = multer({
    storage: multer.memoryStorage()
})
router.post(
  "/upload",
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "files", maxCount: 8 },
  ]),
  storageController.upload
);

module.exports = router;
