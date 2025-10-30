import React from 'react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Grid from '../components/ui/Grid';
import Container from '../components/ui/Container';
import Flex from '../components/ui/Flex';
import FormGroup from '../components/ui/FormGroup';
import WorkoutCard from '../components/workout/WorkoutCard';
import NutritionCard from '../components/nutrition/NutritionCard';
import AppointmentCard from '../components/appointment/AppointmentCard';
import PaymentCard from '../components/payment/PaymentCard';
import StatCard from '../components/dashboard/StatCard';

export default function ComponentDemo() {
  // Sample data
  const workout = {
    id: '1',
    name: 'Full Body Workout',
    type: 'Strength',
    difficulty: 'Intermediate',
    duration: 45,
    calories: 350
  };

  const nutrition = {
    id: '1',
    name: 'Protein Meal Plan',
    calories: 1800,
    protein: 150,
    carbs: 100,
    fat: 60
  };

  const appointment = {
    id: '1',
    title: 'Personal Training Session',
    trainerName: 'John Doe',
    date: '2023-06-15T10:00:00',
    duration: 60,
    status: 'scheduled',
    notes: 'Focus on upper body strength'
  };

  const payment = {
    id: '123456789abcdef',
    amount: 99.99,
    date: '2023-06-10',
    status: 'completed',
    method: 'Credit Card',
    description: 'Monthly Subscription'
  };

  return (
    <Container>
      <h1 className="text-3xl font-bold mb-8 text-center">Responsive UI Components</h1>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Base Components</h2>
        
        <Card title="Button Variants" className="mb-8">
          <h3 className="text-lg font-medium mb-4">Standard Buttons</h3>
          <Flex gap={2} className="mb-6">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="success">Success</Button>
            <Button variant="ghost">Ghost</Button>
          </Flex>
          
          <h3 className="text-lg font-medium mb-4">Button Sizes</h3>
          <Flex gap={2} className="mb-6">
            <Button size="xs">Extra Small</Button>
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <Button size="xl">Extra Large</Button>
          </Flex>
          
          <h3 className="text-lg font-medium mb-4">Full Width Responsive Buttons</h3>
          <div className="space-y-2 max-w-md">
            <Button fullWidth>Full Width Button</Button>
            <Button variant="outline" fullWidth>Full Width Outline</Button>
          </div>
        </Card>
        
        <Card title="Form Components" className="mb-8">
          <FormGroup>
            <Input label="Standard Input" placeholder="Enter text" />
            <Input 
              label="Input with Icon" 
              placeholder="Search..." 
              leftIcon={
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />
            <Input 
              label="Password Input" 
              type="password" 
              placeholder="Enter password" 
              rightIcon={
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              }
            />
          </FormGroup>
        </Card>
        
        <Card title="Layout Components" className="mb-8">
          <h3 className="text-lg font-medium mb-4">Grid Layout</h3>
          <Grid cols={{ default: 1, sm: 2, md: 3, lg: 4 }} gap={4} className="mb-6">
            <div className="bg-primary-100 p-4 rounded-md text-center">Item 1</div>
            <div className="bg-primary-100 p-4 rounded-md text-center">Item 2</div>
            <div className="bg-primary-100 p-4 rounded-md text-center">Item 3</div>
            <div className="bg-primary-100 p-4 rounded-md text-center">Item 4</div>
          </Grid>
          
          <h3 className="text-lg font-medium mb-4">Flex Layout</h3>
          <Flex gap={4} className="mb-6">
            <div className="bg-secondary-100 p-4 rounded-md text-center">Flex 1</div>
            <div className="bg-secondary-100 p-4 rounded-md text-center">Flex 2</div>
            <div className="bg-secondary-100 p-4 rounded-md text-center">Flex 3</div>
          </Flex>
        </Card>
      </section>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Module-Specific Components</h2>
        
        <Grid cols={{ default: 1, md: 2 }} gap={6} className="mb-8">
          <WorkoutCard 
            workout={workout} 
            onView={(id) => console.log('View workout', id)} 
            onEdit={(id) => console.log('Edit workout', id)} 
            onDelete={(id) => console.log('Delete workout', id)} 
          />
          
          <NutritionCard 
            nutrition={nutrition} 
            onView={(id) => console.log('View nutrition', id)} 
            onEdit={(id) => console.log('Edit nutrition', id)} 
            onDelete={(id) => console.log('Delete nutrition', id)} 
          />
        </Grid>
        
        <Grid cols={{ default: 1, md: 2 }} gap={6} className="mb-8">
          <AppointmentCard 
            appointment={appointment} 
            onView={(id) => console.log('View appointment', id)} 
            onEdit={(id) => console.log('Edit appointment', id)} 
            onCancel={(id) => console.log('Cancel appointment', id)} 
          />
          
          <PaymentCard 
            payment={payment} 
            onView={(id) => console.log('View payment', id)} 
          />
        </Grid>
        
        <h3 className="text-xl font-semibold mb-4">Dashboard Stats</h3>
        <Grid cols={{ default: 1, sm: 2, lg: 4 }} gap={4}>
          <StatCard 
            title="Total Workouts" 
            value="24" 
            change="+12%" 
            changeType="increase" 
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
          />
          <StatCard 
            title="Active Members" 
            value="156" 
            change="+8%" 
            changeType="increase" 
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
          <StatCard 
            title="Revenue" 
            value="$12,456" 
            change="+23%" 
            changeType="increase" 
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard 
            title="Appointments" 
            value="38" 
            change="-5%" 
            changeType="decrease" 
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
        </Grid>
      </section>
    </Container>
  );
}