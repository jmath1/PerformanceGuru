const optimizationMetrics = {
  indexing: {
    mongodb: ["cpuUsage", "openFileDescriptors"],
    redis: [],
    postgres: ["bufferCacheHitRatio", "tasksTableSequentialScansAndDeadTuples"],
  },
  caching: {
    mongodb: [],
    redis: ["cacheHitRatio", "commandLatency", "memoryUsage"],
    postgres: [],
  },
  batching: {
    mongodb: ["networkIORates", "heapAllocations"],
    redis: [],
    postgres: ["transactionThroughputCommits"],
  },
  pagination: {
    mongodb: ["cpuUsage"],
    redis: [],
    postgres: ["bufferCacheHitRatio"],
  },
  pooling: {
    mongodb: ["openFileDescriptors"],
    redis: [],
    postgres: ["activeConnections"],
  },
  async: {
    mongodb: ["cpuUsage", "networkIORates"],
    redis: ["commandLatency"],
    postgres: ["transactionThroughputCommits"],
  },
};

export default optimizationMetrics;
