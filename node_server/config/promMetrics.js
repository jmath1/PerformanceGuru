const promClient = require("prom-client");

const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

const httpRequestDuration = new promClient.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "code"],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 10],
});
register.registerMetric(httpRequestDuration);

const cacheHitCounter = new promClient.Counter({
  name: "cache_hits_total",
  help: "Total number of cache hits",
});
const cacheMissCounter = new promClient.Counter({
  name: "cache_misses_total",
  help: "Total number of cache misses",
});
register.registerMetric(cacheHitCounter);
register.registerMetric(cacheMissCounter);

const middleware = (req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on("finish", () => {
    end({ method: req.method, route: req.path, code: res.statusCode });
  });
  next();
};

module.exports = { register, middleware, cacheHitCounter, cacheMissCounter };
