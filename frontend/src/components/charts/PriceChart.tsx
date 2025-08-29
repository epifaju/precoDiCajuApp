import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { useAppStore } from '../../store/appStore';
import { useTranslation } from 'react-i18next';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

interface PriceData {
  date: string;
  price: number;
  region?: string;
  quality?: string;
}

interface ChartProps {
  data: PriceData[];
  type?: 'line' | 'bar' | 'doughnut';
  title: string;
  description?: string;
  className?: string;
  loading?: boolean;
  groupBy?: 'date' | 'region' | 'quality';
  showTrend?: boolean;
}

export const PriceChart: React.FC<ChartProps> = ({
  data,
  type = 'line',
  title,
  description,
  className,
  loading = false,
  groupBy = 'date',
  showTrend = false,
}) => {
  const { t } = useTranslation();
  const { theme } = useAppStore();
  const isDark = theme === 'dark';

  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        labels: [],
        datasets: [],
      };
    }

    // Common chart colors
    const colors = [
      { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgb(59, 130, 246)' }, // Blue
      { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgb(16, 185, 129)' }, // Green
      { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgb(245, 158, 11)' }, // Yellow
      { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgb(239, 68, 68)' }, // Red
      { bg: 'rgba(139, 92, 246, 0.1)', border: 'rgb(139, 92, 246)' }, // Purple
      { bg: 'rgba(236, 72, 153, 0.1)', border: 'rgb(236, 72, 153)' }, // Pink
    ];

    switch (groupBy) {
      case 'region': {
        const regionData = data.reduce((acc, item) => {
          const region = item.region || 'Unknown';
          if (!acc[region]) acc[region] = [];
          acc[region].push(item.price);
          return acc;
        }, {} as Record<string, number[]>);

        const labels = Object.keys(regionData);
        const avgPrices = labels.map(region => 
          regionData[region].reduce((sum, price) => sum + price, 0) / regionData[region].length
        );

        if (type === 'doughnut') {
          return {
            labels,
            datasets: [{
              label: t('dashboard.averagePrice', 'Average Price (FCFA)'),
              data: avgPrices,
              backgroundColor: colors.map(c => c.bg),
              borderColor: colors.map(c => c.border),
              borderWidth: 2,
            }],
          };
        }

        return {
          labels,
          datasets: [{
            label: t('dashboard.averagePrice', 'Average Price (FCFA)'),
            data: avgPrices,
            backgroundColor: colors[0].bg,
            borderColor: colors[0].border,
            borderWidth: 2,
            tension: 0.4,
            fill: type === 'line' ? true : false,
          }],
        };
      }

      case 'quality': {
        const qualityData = data.reduce((acc, item) => {
          const quality = item.quality || 'Unknown';
          if (!acc[quality]) acc[quality] = [];
          acc[quality].push(item.price);
          return acc;
        }, {} as Record<string, number[]>);

        const labels = Object.keys(qualityData);
        const avgPrices = labels.map(quality => 
          qualityData[quality].reduce((sum, price) => sum + price, 0) / qualityData[quality].length
        );

        if (type === 'doughnut') {
          return {
            labels,
            datasets: [{
              label: t('dashboard.averagePrice', 'Average Price (FCFA)'),
              data: avgPrices,
              backgroundColor: colors.map(c => c.bg),
              borderColor: colors.map(c => c.border),
              borderWidth: 2,
            }],
          };
        }

        return {
          labels,
          datasets: [{
            label: t('dashboard.averagePrice', 'Average Price (FCFA)'),
            data: avgPrices,
            backgroundColor: colors[1].bg,
            borderColor: colors[1].border,
            borderWidth: 2,
            tension: 0.4,
            fill: type === 'line' ? true : false,
          }],
        };
      }

      default: {
        // Group by date
        const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const labels = sortedData.map(item => new Date(item.date).toLocaleDateString());
        const prices = sortedData.map(item => item.price);

        return {
          labels,
          datasets: [{
            label: t('dashboard.price', 'Price (FCFA)'),
            data: prices,
            backgroundColor: colors[0].bg,
            borderColor: colors[0].border,
            borderWidth: 2,
            tension: 0.4,
            fill: type === 'line' ? true : false,
            pointBackgroundColor: colors[0].border,
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
          }],
        };
      }
    }
  }, [data, groupBy, type, t]);

  const options = useMemo(() => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
          labels: {
            color: isDark ? '#e5e7eb' : '#374151',
            font: {
              size: 12,
            },
          },
        },
        tooltip: {
          backgroundColor: isDark ? '#1f2937' : '#ffffff',
          titleColor: isDark ? '#f9fafb' : '#111827',
          bodyColor: isDark ? '#e5e7eb' : '#374151',
          borderColor: isDark ? '#374151' : '#d1d5db',
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: true,
          callbacks: {
            label: function(context: any) {
              const label = context.dataset.label || '';
              const value = typeof context.parsed === 'object' 
                ? context.parsed.y 
                : context.parsed;
              return `${label}: ${value?.toLocaleString()} FCFA`;
            },
          },
        },
      },
      scales: type !== 'doughnut' ? {
        x: {
          grid: {
            color: isDark ? '#374151' : '#f3f4f6',
          },
          ticks: {
            color: isDark ? '#9ca3af' : '#6b7280',
            font: {
              size: 11,
            },
          },
        },
        y: {
          grid: {
            color: isDark ? '#374151' : '#f3f4f6',
          },
          ticks: {
            color: isDark ? '#9ca3af' : '#6b7280',
            font: {
              size: 11,
            },
            callback: function(value: any) {
              return value?.toLocaleString() + ' FCFA';
            },
          },
        },
      } : {},
    };

    return baseOptions;
  }, [isDark, type]);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
              {description && (
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded animate-pulse flex items-center justify-center">
            <div className="text-gray-400 dark:text-gray-600">
              Loading chart...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="mt-2 text-sm">
                {t('dashboard.noData', 'No data available')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return <Bar data={chartData} options={options} />;
      case 'doughnut':
        return <Doughnut data={chartData} options={options} />;
      default:
        return <Line data={chartData} options={options} />;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="h-64">
          {renderChart()}
        </div>
      </CardContent>
    </Card>
  );
};

