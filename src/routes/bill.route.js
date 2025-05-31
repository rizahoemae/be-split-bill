const express = require("express");
const router = express.Router();
const billController = require("../controller/bill.controller");

router.get("/", billController.getAll);
router.post("/create", billController.create);
router.post("/scan", billController.scan);
router.get("/:id", billController.getOne);
router.delete("/:id", billController.deleteOne);
router.put("/update/:id", billController.updatePayment);

module.exports = router;
