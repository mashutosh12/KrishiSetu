import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

// Debug logs to check if env vars are loaded
console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Key exists:", !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase credentials in environment variables");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Database functions for crops and planting schedules
export const getCrops = async (filters = {}) => {
  let query = supabase.from('crops').select('*');
  
  if (filters.season) {
    query = query.eq('planting_season', filters.season);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data;
};

export const getCropById = async (id) => {
  const { data, error } = await supabase
    .from('crops')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) throw error;
  return data;
};

export const createPlantingSchedule = async (scheduleData) => {
  const { data, error } = await supabase
    .from('planting_schedules')
    .insert([scheduleData])
    .select();
    
  if (error) throw error;
  return data[0];
};

export const getUserPlantingSchedules = async (userId) => {
  const { data, error } = await supabase
    .from('planting_schedules')
    .select(`
      *,
      crops (*)
    `)
    .eq('user_id', userId);
    
  if (error) throw error;
  return data;
};

export const updatePlantingSchedule = async (id, updates) => {
  const { data, error } = await supabase
    .from('planting_schedules')
    .update(updates)
    .eq('id', id)
    .select();
    
  if (error) throw error;
  return data[0];
};

export const deletePlantingSchedule = async (id) => {
  const { error } = await supabase
    .from('planting_schedules')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
  return true;
};

export default {
  supabase,
  getCrops,
  getCropById,
  createPlantingSchedule,
  getUserPlantingSchedules,
  updatePlantingSchedule,
  deletePlantingSchedule
};