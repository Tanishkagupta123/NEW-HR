const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboardController");

router.get("/summary", dashboardController.getSummary);
router.get("/task", dashboardController.getDashboard);
router.post("/task", dashboardController.createTask);
router.get("/task/:id", dashboardController.getTaskById);

router.put("/task/:id", dashboardController.updateTask);

router.delete("/task/:id", dashboardController.deleteTask);

module.exports = router;
