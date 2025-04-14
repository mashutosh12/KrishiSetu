import * as db from '../models/database.js';
import * as weatherService from '../services/weatherService.js';
import { validationResult } from 'express-validator';

const calculateHarvestDate = (plantingDate, daysToHarvest) => {
  const harvestDate = new Date(plantingDate);
  harvestDate.setDate(harvestDate.getDate() + daysToHarvest);
  return harvestDate.toISOString().split('T')[0];
};

export const getRecommendedCrops = async (req, res, next) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }
    
    // Detect current season based on weather
    const season = await weatherService.detectSeason(parseFloat(lat), parseFloat(lon));
    
    // Get weather forecast
    const forecast = await weatherService.getForecast(parseFloat(lat), parseFloat(lon));
    
    // Get crops suitable for the current season
    const crops = await db.getCrops({ season });
    
    // Calculate suitability score based on current weather conditions
    const currentWeather = await weatherService.getCurrentWeather(parseFloat(lat), parseFloat(lon));
    const currentTemp = currentWeather.main.temp;
    
    const recommendedCrops = crops.map(crop => {
      // Calculate temperature suitability (0-100)
      const tempSuitability = 100 - Math.min(100, 
        Math.max(0, 
          Math.abs(currentTemp - ((crop.optimal_temp_min + crop.optimal_temp_max) / 2)) * 5
        )
      );
      
      return {
        ...crop,
        suitability: tempSuitability,
        plantingDate: new Date().toISOString().split('T')[0],
        harvestDate: calculateHarvestDate(new Date(), crop.days_to_harvest)
      };
    });
    
    // Sort by suitability score
    recommendedCrops.sort((a, b) => b.suitability - a.suitability);
    
    res.json({
      success: true,
      data: {
        season,
        currentWeather: {
          temperature: currentTemp,
          humidity: currentWeather.main.humidity,
          conditions: currentWeather.weather[0].main
        },
        forecast,
        crops: recommendedCrops
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createPlantingSchedule = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const { crop_id, user_id, planting_date, plot_location, notes } = req.body;
    
    // Get crop details to calculate harvest date
    const crop = await db.getCropById(crop_id);
    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found'
      });
    }
    
    // Calculate expected harvest date
    const plantingDateObj = new Date(planting_date);
    const expectedHarvestDate = calculateHarvestDate(plantingDateObj, crop.days_to_harvest);
    
    // Create new planting schedule
    const schedule = await db.createPlantingSchedule({
      crop_id,
      user_id,
      planting_date,
      expected_harvest_date: expectedHarvestDate,
      plot_location,
      notes
    });
    
    res.status(201).json({
      success: true,
      data: schedule
    });
  } catch (error) {
    next(error);
  }
};

export const getUserPlantingSchedules = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const schedules = await db.getUserPlantingSchedules(userId);
    
    res.json({
      success: true,
      data: schedules
    });
  } catch (error) {
    next(error);
  }
};

export const updatePlantingSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { planting_date, plot_location, notes, user_id } = req.body;
    
    // Get the schedule and associated crop
    const schedules = await db.getUserPlantingSchedules(user_id);
    const schedule = schedules.find(s => s.id === parseInt(id));
    
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Planting schedule not found'
      });
    }
    
    // Calculate new harvest date if planting date changed
    let updates = { plot_location, notes };
    
    if (planting_date && planting_date !== schedule.planting_date) {
      const crop = await db.getCropById(schedule.crop_id);
      const plantingDateObj = new Date(planting_date);
      const expectedHarvestDate = calculateHarvestDate(plantingDateObj, crop.days_to_harvest);
      
      updates = {
        ...updates,
        planting_date,
        expected_harvest_date: expectedHarvestDate
      };
    }
    
    const updatedSchedule = await db.updatePlantingSchedule(id, updates);
    
    res.json({
      success: true,
      data: updatedSchedule
    });
  } catch (error) {
    next(error);
  }
};

export const deletePlantingSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    await db.deletePlantingSchedule(id);
    
    res.json({
      success: true,
      message: 'Planting schedule deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getRecommendedCrops,
  createPlantingSchedule,
  getUserPlantingSchedules,
  updatePlantingSchedule,
  deletePlantingSchedule
};