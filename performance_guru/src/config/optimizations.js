const optimizations = [
  {
    id: "indexing",
    name: "Database Indexing",
    description:
      "Indexes speed up data retrieval by avoiding full table scans. We index user_id (PostgreSQL) and task_id (MongoDB) to enhance query performance.",
  },
  {
    id: "caching",
    name: "Caching with Redis",
    description:
      "Caching stores task lists in Redis to avoid database queries, reducing latency by 50-80% for frequently accessed data.",
  },
  {
    id: "batching",
    name: "Query Batching",
    description:
      "Batching combines multiple inserts into one query, cutting latency by 50-80% for bulk operations.",
  },
  {
    id: "pagination",
    name: "Pagination",
    description:
      "Pagination limits fetched rows, speeding up queries by 2-10x for large datasets.",
  },
  {
    id: "pooling",
    name: "Connection Pooling",
    description:
      "Connection pooling reuses database connections, reducing latency by 30-50% under high load.",
  },
  {
    id: "async",
    name: "Asynchronous Queries",
    description:
      "Async queries run in parallel, cutting response time by 30-50% for multi-database calls.",
  },
];

export default optimizations;
