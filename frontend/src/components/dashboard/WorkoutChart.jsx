import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

export default function WorkoutChart({ workouts = [] }) {
  const last7DaysLabels = useMemo(() => {
    const labels = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      labels.push(d.toLocaleDateString());
    }
    return labels;
  }, []);

  const data = useMemo(() => {
    const countsByDay = new Array(7).fill(0);
    const now = new Date();
    workouts.forEach((w) => {
      const dateStr = w?.date || w?.createdAt;
      if (!dateStr) return;
      const d = new Date(dateStr);
      // Calculate difference in days
      const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
      const index = 6 - diffDays; // map to last7DaysLabels index
      if (index >= 0 && index < 7) {
        countsByDay[index] += 1;
      }
    });

    return {
      labels: last7DaysLabels,
      datasets: [
        {
          label: 'Workouts in last 7 days',
          data: countsByDay,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          tension: 0.3,
          fill: true,
        },
      ],
    };
  }, [workouts, last7DaysLabels]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    interaction: {
      mode: 'nearest',
      intersect: false,
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="w-full">
      <Line data={data} options={options} />
    </div>
  );
}