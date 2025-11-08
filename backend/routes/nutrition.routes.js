const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const nutritionController = require('../controllers/nutrition.controller');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Meal plan routes
router.get('/plans', nutritionController.getAllMealPlans);
router.get('/plans/:id', nutritionController.getMealPlan);
router.post('/plans', nutritionController.createMealPlan);
router.patch('/plans/:id', nutritionController.updateMealPlan);
router.delete('/plans/:id', nutritionController.deleteMealPlan);

// Nutrition log routes
router.get('/', nutritionController.getAllNutritionLogs);
router.get('/:id', nutritionController.getNutritionLog);
router.post('/', nutritionController.createNutritionLog);
router.patch('/:id', nutritionController.updateNutritionLog);
router.delete('/:id', nutritionController.deleteNutritionLog);

module.exports = router;