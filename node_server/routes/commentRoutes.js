const express = require("express");
const { mongoClient } = require("../config/database");

const router = express.Router();

router.post("/", async (req, res) => {
  const { task_id, content } = req.body;
  if (!task_id || !content) {
    return res.status(400).json({ message: "Missing task_id or content" });
  }

  try {
    const db = mongoClient.db(process.env.MONGO_DB_NAME || "taskdb");
    const comment = { task_id, content, created_at: new Date() };
    const result = await db.collection("comments").insertOne(comment);
    res.json({ _id: result.insertedId, ...comment });
  } catch (err) {
    console.error("Error inserting comment:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
