import React, { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { FaServer, FaDesktop, FaHdd } from 'react-icons/fa';
import styles from './Dashboard.module.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const getAssetTypeDetails = (type) => {
  const lowerType = type ? type.toLowerCase() : 'unknown';
  if (lowerType.includes('workstation')) return { name: 'Workstations', Icon: FaDesktop };
  if (lowerType.includes('server') || lowerType.includes('virtual_machine') || lowerType.includes('hyperv')) return { name: 'Servers / VMs', Icon: FaServer };
  return { name: 'Other Assets', Icon: FaHdd };
};

const AssetTypeChart = ({ agentData }) => {
  const chartData = useMemo(() => {
    const counts = agentData.reduce((acc, agent) => {
      const { name } = getAssetTypeDetails(agent.asset_type);
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(counts),
      datasets: [{
        label: '# of Assets',
        data: Object.values(counts),
        backgroundColor: ['#36A2EB', '#4BC0C0', '#FFCD56', '#9966FF', '#FF9F40'],
        borderColor: '#fff',
        borderWidth: 2,
      }],
    };
  }, [agentData]);

  // --- THIS IS THE UPDATED OPTIONS OBJECT ---
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        display: false, // This is the key: it hides the default legend at the top
      },
      tooltip: {
        backgroundColor: '#1a202c',
        titleFont: { size: 14 },
        bodyFont: { size: 12 },
      },
    },
  };

  return (
    <div className={styles.assetChartContainer}>
      {/* The inline style is now gone and replaced by the className */}
      <div className={styles.chartWrapper}>
        <Doughnut data={chartData} options={options} />
      </div>
      
      <div className={styles.summaryList}>
        {chartData.labels.length > 0 ? (
          chartData.labels.map((label, index) => {
            const { Icon } = getAssetTypeDetails(label);
            const count = chartData.datasets[0].data[index];
            const backgroundColor = chartData.datasets[0].backgroundColor[index];
            return (
              <div key={label} className={styles.summaryItem}>
                {/* The dynamic color is a valid use of inline style */}
                <div className={styles.legendIcon} style={{ backgroundColor: backgroundColor }}></div>
                <span>{label}</span>
                <span className={styles.summaryCount}>{count}</span>
              </div>
            );
          })
        ) : (
          <div className={styles.noDataMessage}>No asset data to display.</div>
        )}
      </div>
    </div>
  );
};

export default AssetTypeChart;