export interface SystemMetric {
  timestamp: string;
  metricName: string;
  value: number;
  tags?: Record<string, string>;
}

const metricsStore: SystemMetric[] = [];

export function recordMetric(metricName: string, value: number, tags?: Record<string, string>) {
  metricsStore.push({
    timestamp: new Date().toISOString(),
    metricName,
    value,
    tags,
  });
}

export function getHealthStatus() {
  const memoryUsage = process.memoryUsage();
  return {
    status: 'HEALTHY',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    system: {
      heapUsedMb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      heapTotalMb: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      rssMb: Math.round(memoryUsage.rss / 1024 / 1024),
    },
    metricsRecorded: metricsStore.length,
  };
}
