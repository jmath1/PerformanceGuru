const grafanaMetrics = {
  mongodb: {
    cpuUsage: {
      dashboard: "eejuqk347e6m8c",
      panelId: 2,
      description:
        "The **CPU Usage** metric shows the percentage of CPU resources used by the MongoDB server. High CPU usage may indicate heavy query processing or inefficient queries. Monitoring this helps identify bottlenecks and determine if CPU scaling is needed. For example, sustained high usage (>80%) suggests optimizing queries or upgrading hardware.",
    },
    residentialMemoryUsage: {
      dashboard: "eejuqk347e6m8c",
      panelId: 3,
      description:
        "**Residential Memory Usage** measures the physical RAM used by MongoDB for data and indexes. MongoDB relies on memory for caching, so high usage is normal, but excessive growth may cause swapping. This metric ensures the server has enough RAM and the working set fits in memory.",
    },
    networkIORates: {
      dashboard: "eejuqk347e6m8c",
      panelId: 4,
      description:
        "**Network I/O Rates** track data sent and received by MongoDB over the network (bytes/second). High rates may indicate heavy client activity or replication. Monitoring this helps diagnose network bottlenecks and optimize replication or network infrastructure.",
    },
    openFileDescriptors: {
      dashboard: "eejuqk347e6m8c",
      panelId: 5,
      description:
        "**Open File Descriptors** show the number of files, sockets, or connections MongoDB has open. Each connection consumes a descriptor, and hitting system limits can cause errors. This metric helps tune connection pools and ensure MongoDB operates within OS limits.",
    },
    goRoutinesCount: {
      dashboard: "eejuqk347e6m8c",
      panelId: 6,
      description:
        "**Go Routines Count** tracks lightweight threads used by MongoDB’s Go-based components (e.g., exporters). A high count may indicate heavy concurrent processing. Monitoring this ensures monitoring tools don’t overload the system.",
    },
    heapAllocations: {
      dashboard: "eejuqk347e6m8c",
      panelId: 7,
      description:
        "**Heap Allocations** measure memory allocated on the heap for MongoDB’s runtime operations. Rapid growth may indicate memory leaks or inefficient queries. This metric helps optimize memory usage and prevent excessive garbage collection.",
    },
    gcPauseDuration: {
      dashboard: "eejuqk347e6m8c",
      panelId: 8,
      description:
        "**GC Pause Duration** tracks time spent in garbage collection pauses for MongoDB’s Go-based components. Long pauses can cause latency spikes. Monitoring this helps tune garbage collection to minimize performance impacts.",
    },
  },
  redis: {
    commandLatency: {
      dashboard: "dejup6fjeb3eob",
      panelId: 1,
      description:
        "**Command Latency** measures the time taken to execute Redis commands (e.g., GET, SET). High latency may indicate server overload or slow commands. This metric ensures Redis responds quickly and helps identify operations needing optimization.",
    },
    memoryUsage: {
      dashboard: "dejup6fjeb3eob",
      panelId: 2,
      description:
        "**Memory Usage** shows the total memory used by Redis for keys and internal structures. As an in-memory database, high usage is expected, but exceeding RAM can cause eviction or crashes. This metric helps size memory and configure eviction policies.",
    },
    memoryFragmentationRatio: {
      dashboard: "dejup6fjeb3eob",
      panelId: 3,
      description:
        "**Memory Fragmentation Ratio** indicates how efficiently Redis uses allocated memory. A high ratio (>1.5) suggests fragmentation, wasting memory. Monitoring this helps optimize memory allocation or restart Redis to defragment.",
    },
    cacheHitRatio: {
      dashboard: "dejup6fjeb3eob",
      panelId: 4,
      description:
        "**Cache Hit Ratio** measures the percentage of key lookups resulting in hits versus misses. A low ratio (<80%) indicates ineffective caching. This metric ensures Redis serves data efficiently and guides key management.",
    },
    cpuUsage: {
      dashboard: "dejup6fjeb3eob",
      panelId: 5,
      description:
        "**CPU Usage** tracks CPU resources used by Redis. Since Redis is single-threaded for most operations, high usage may indicate heavy command processing. This metric helps optimize commands or scale hardware.",
    },
  },
  postgres: {
    transactionThroughputCommits: {
      dashboard: "cejupzxdr9kowb",
      panelId: 1,
      description:
        "**Transaction Throughput (Commits)** measures the rate of committed transactions per second in PostgreSQL. High throughput indicates a busy database, while drops may signal locking issues. This metric assesses workload and transaction performance.",
    },
    bufferCacheHitRatio: {
      dashboard: "cejupzxdr9kowb",
      panelId: 2,
      description:
        "**Buffer Cache Hit Ratio** shows the percentage of data requests served from PostgreSQL’s buffer cache versus disk. A low ratio (<90%) suggests insufficient memory, causing slow I/O. This metric helps tune memory settings like shared_buffers.",
    },
    activeConnections: {
      dashboard: "cejupzxdr9kowb",
      panelId: 3,
      description:
        "**Active Connections** tracks clients connected to PostgreSQL. High counts can exhaust resources or hit max_connections, causing refusals. This metric helps optimize connection pooling and manage client load.",
    },
    deadlocksDetected: {
      dashboard: "cejupzxdr9kowb",
      panelId: 4,
      description:
        "**Deadlocks Detected** counts instances where transactions block each other, forcing PostgreSQL to terminate one. Frequent deadlocks indicate poorly designed transactions. This metric helps refine transaction logic to minimize conflicts.",
    },
    exporterScrapeDuration: {
      dashboard: "cejupzxdr9kowb",
      panelId: 5,
      description:
        "**Exporter Scrape Duration** measures the time taken by the PostgreSQL Prometheus exporter to collect metrics. Long durations may indicate slow queries or exporter issues. This metric ensures monitoring performs efficiently.",
    },
    lockContentionByMode: {
      dashboard: "cejupzxdr9kowb",
      panelId: 6,
      description:
        "**Lock Contention by Mode** tracks locks held or waited on, by type (e.g., row, table). High contention suggests transactions compete for resources, causing delays. This metric helps resolve locking bottlenecks.",
    },
    databaseSize: {
      dashboard: "cejupzxdr9kowb",
      panelId: 7,
      description:
        "**Database Size** measures the storage used by the PostgreSQL database. Rapid growth may indicate unoptimized data retention. Monitoring this helps plan storage and optimize maintenance tasks like vacuuming.",
    },
    tasksTableSequentialScansAndDeadTuples: {
      dashboard: "cejupzxdr9kowb",
      panelId: 8,
      description:
        "**Tasks Table Sequential Scans and Dead Tuples** tracks sequential scans and dead tuples in the tasks table. Frequent scans suggest missing indexes, and high dead tuples indicate vacuuming issues. This metric guides indexing and maintenance.",
    },
    backgroundWriterBuffers: {
      dashboard: "cejupzxdr9kowb",
      panelId: 9,
      description:
        "**Background Writer Buffers** measures buffers written by PostgreSQL’s background writer, syncing dirty buffers to disk. High values indicate heavy write activity. This metric helps optimize write performance and checkpoint settings.",
    },
  },
};

export default grafanaMetrics;
