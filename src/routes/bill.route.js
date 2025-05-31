const express = require("express");
const router = express.Router();
const billController = require("../controller/bill.controller");
const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
});

router.get("/", billController.getAll);
router.post("/create", billController.create);
router.post("/scan", billController.scan);
router.post(
  "/upload-scan",
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "files", maxCount: 8 },
  ]),
  billController.uploadScan
);
router.get("/:id", billController.getOne);
router.delete("/:id", billController.deleteOne);
router.put("/update/:id", billController.updatePayment);

module.exports = router;
