const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskStatsSummary,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

// All task routes require authorization
router.use(protect);

// IMPORTANT: Define /stats/summary BEFORE /:id so it's not captured as a parameter
router.get('/stats/summary', getTaskStatsSummary);

router.route('/')
  .get(getTasks)
  .post(createTask);

router.route('/:id')
  .get(getTaskById)
  .put(updateTask)
  .delete(deleteTask);

module.exports = router;
