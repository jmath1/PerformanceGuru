const express = require("express");
const cors = require("cors");
const { mongoClient } = require("./config/database");
const promMetrics = require("./config/promMetrics");
const configRoutes = require("./routes/configRoutes");
const taskRoutes = require("./routes/taskRoutes");
const commentRoutes = require("./routes/commentRoutes");
const testRoutes = require("./routes/testRoutes");

const app = express();
app.use(express.json());
app.use(cors());

app.use(promMetrics.middleware);

app.use("/config", configRoutes);
app.use("/tasks", taskRoutes);
app.use("/comments", commentRoutes);
app.use("/test", testRoutes);

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", promMetrics.register.contentType);
  res.end(await promMetrics.register.metrics());
});

// Start server
const PORT = 3001;
app.listen(PORT, async () => {
  await mongoClient.connect();
  console.log(`Server running on port ${PORT}`);
});
