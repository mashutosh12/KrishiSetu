import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
export const saveProfile = async (req, res) => {
  const { user_id, name, email, phone, address, soil_type, farm_size } = req.body;

  const { error } = await supabase
    .from('farmer_profiles')
    .upsert({ user_id, name, email, phone, address, soil_type, farm_size });

  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json({ message: 'Profile saved successfully' });
};

export const getProfile = async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('farmer_profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json(data);
};