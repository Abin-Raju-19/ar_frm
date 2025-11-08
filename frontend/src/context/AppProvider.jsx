import React from 'react';
import { AuthProvider } from './AuthContext';
import { AppointmentProvider } from './AppointmentContext';
import { WorkoutProvider } from './WorkoutContext';
import { NutritionProvider } from './NutritionContext';
import { PaymentProvider } from './PaymentContext';

export const AppProvider = ({ children }) => {
  return (
    <AuthProvider>
      <AppointmentProvider>
        <WorkoutProvider>
          <NutritionProvider>
            <PaymentProvider>{children}</PaymentProvider>
          </NutritionProvider>
        </WorkoutProvider>
      </AppointmentProvider>
    </AuthProvider>
  );
};