import express from 'express';
import { body } from 'express-validator';
import * as plannerController from '../controllers/plannerController.js';

const router = express.Router();

router.get('/recommended-crops', plannerController.getRecommendedCrops);

router.post('/schedules', [
  body('crop_id').isInt().withMessage('Valid crop ID is required'),
  body('user_id').notEmpty().withMessage('User ID is required'),
  body('planting_date').isDate().withMessage('Valid planting date is required'),
  body('plot_location').optional().isString(),
  body('notes').optional().isString()
], plannerController.createPlantingSchedule);

router.get('/schedules/:userId', plannerController.getUserPlantingSchedules);

router.put('/schedules/:id', plannerController.updatePlantingSchedule);

router.delete('/schedules/:id', plannerController.deletePlantingSchedule);

export default router;