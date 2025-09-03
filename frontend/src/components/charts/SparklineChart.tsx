import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export interface SparklineDataPoint {
  date: string;
  price: number;
}

export interface SparklineChartProps {
  data: SparklineDataPoint[];
  width?: number;
  height?: number;
  showTrend?: boolean;
  className?: string;
}

export const SparklineChart: React.FC<SparklineChartProps> = ({
  data,
  width = 140,
  height = 40,
  showTrend = true,
  className = '',
}) => {
  // Si pas de données, afficher un graphique vide
  if (!data || data.length === 0) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded ${className}`}
        style={{ width, height }}
      >
        <span className="text-xs text-gray-500 dark:text-gray-400">No data</span>
      </div>
    );
  }

  // Calculer la tendance
  const calculateTrend = (data: SparklineDataPoint[]) => {
    if (data.length < 2) return 'stable';
    
    const firstPrice = data[0].price;
    const lastPrice = data[data.length - 1].price;
    const change = ((lastPrice - firstPrice) / firstPrice) * 100;
    
    if (change > 2) return 'up';
    if (change < -2) return 'down';
    return 'stable';
  };

  const trend = calculateTrend(data);
  
  // Couleurs basées sur la tendance
  const getColors = (trend: string) => {
    switch (trend) {
      case 'up':
        return {
          border: 'rgb(34, 197, 94)', // green-500
          background: 'rgba(34, 197, 94, 0.1)',
          point: 'rgb(34, 197, 94)',
        };
      case 'down':
        return {
          border: 'rgb(239, 68, 68)', // red-500
          background: 'rgba(239, 68, 68, 0.1)',
          point: 'rgb(239, 68, 68)',
        };
      default:
        return {
          border: 'rgb(107, 114, 128)', // gray-500
          background: 'rgba(107, 114, 128, 0.1)',
          point: 'rgb(107, 114, 128)',
        };
    }
  };

  const colors = getColors(trend);

  // Préparer les données pour Chart.js
  const chartData = {
    labels: data.map(point => {
      // Formater la date pour l'affichage (juste le jour)
      const date = new Date(point.date);
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    }),
    datasets: [
      {
        label: 'Prix',
        data: data.map(point => point.price),
        borderColor: colors.border,
        backgroundColor: colors.background,
        borderWidth: 2,
        pointRadius: 0, // Pas de points pour un look sparkline
        pointHoverRadius: 4,
        pointHoverBackgroundColor: colors.point,
        pointHoverBorderColor: colors.point,
        fill: true,
        tension: 0.4, // Courbe lisse
      },
    ],
  };

  // Configuration du graphique pour un look sparkline
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: colors.border,
        borderWidth: 1,
        cornerRadius: 6,
        displayColors: false,
        callbacks: {
          title: (context) => {
            const dataIndex = context[0].dataIndex;
            const date = new Date(data[dataIndex].date);
            return date.toLocaleDateString('fr-FR', { 
              day: '2-digit', 
              month: '2-digit', 
              year: 'numeric' 
            });
          },
          label: (context) => {
            return `${context.parsed.y} FCFA/kg`;
          },
        },
      },
    },
    scales: {
      x: {
        display: false, // Masquer l'axe X pour un look sparkline
        grid: {
          display: false,
        },
        ticks: {
          display: false,
        },
      },
      y: {
        display: false, // Masquer l'axe Y pour un look sparkline
        grid: {
          display: false,
        },
        ticks: {
          display: false,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
    elements: {
      point: {
        hoverRadius: 4,
      },
    },
  };

  return (
    <div className={`relative ${className}`}>
      <div style={{ width, height }}>
        <Line data={chartData} options={options} />
      </div>
      
      {/* Indicateur de tendance */}
      {showTrend && data.length > 1 && (
        <div className="absolute top-0 right-0 flex items-center">
          {trend === 'up' && (
            <svg 
              className="w-3 h-3 text-green-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M7 17l9.2-9.2M17 17V7H7" 
              />
            </svg>
          )}
          {trend === 'down' && (
            <svg 
              className="w-3 h-3 text-red-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M17 7l-9.2 9.2M7 7v10h10" 
              />
            </svg>
          )}
          {trend === 'stable' && (
            <svg 
              className="w-3 h-3 text-gray-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 12h14" 
              />
            </svg>
          )}
        </div>
      )}
    </div>
  );
};

export default SparklineChart;
