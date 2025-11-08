import React from 'react';  
import { createContext, useContext } from 'react';
export const NutritionContext = createContext();
export const useNutrition = () => useContext(NutritionContext);