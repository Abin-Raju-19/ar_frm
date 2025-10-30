// ... existing code ...
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const trainerRoutes = require('./routes/trainer.routes');
// const adminRoutes = require('./routes/admin.routes');
const workoutRoutes = require('./routes/workout.routes');
const nutritionRoutes = require('./routes/nutrition.routes');
const appointmentRoutes = require('./routes/appointment.routes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/trainers', trainerRoutes);
// app.use('/api/admin', adminRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/appointments', appointmentRoutes);