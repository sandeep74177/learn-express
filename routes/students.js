
const express = require("express");
const fs = require("fs");
const router = express.Router();
const mongodb = require("mongodb");

const db = require("../connection");
const collection = db.collection("students");

router.get("/", async (req, res) => {
  try {
    const students = await collection.find().toArray();
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: "Unable to fetch students from the database." });
  }
});

router.get("/:id", getObjectId, async (req, res) => {
  try {
    const student = await collection.findOne({ _id: req.o_id });
    if (!student) {
      res.status(404).json({ message: "Student not found." });
      return;
    }
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: "Unable to fetch the student from the database." });
  }
});

router.post("/", getObjectId, async (req, res) => {
  try {
    const studentData = { ...req.body, _id: req.o_id };
    const result = await collection.insertOne(studentData);
    res.json({ message: "Student added successfully.", student: result });
  } catch (err) {
    res.status(500).json({ message: "Unable to add the student to the database." });
  }
});

router.patch("/:id", getObjectId, async (req, res) => {
  try {
    const updateData = req.body;
    const result = await collection.updateOne(
      { _id: req.o_id },
      { $set: updateData }
    );
    if (result.matchedCount === 0) {
      res.status(404).json({ message: "Student not found." });
      return;
    }
    res.json({ message: "Student updated successfully." });
  } catch (err) {
    res.status(500).json({ message: "Unable to update the student in the database." });
  }
});

router.delete("/:id", getObjectId, async (req, res) => {
  try {
    const result = await collection.deleteOne({ _id: req.o_id });
    if (result.deletedCount === 0) {
      res.status(404).json({ message: "Student not found." });
      return;
    }
    res.json({ message: "Student deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Unable to delete the student from the database." });
  }
});

// Middleware to convert `id` to MongoDB ObjectId
function getObjectId(req, res, next) {
  try {
    req.o_id = new mongodb.ObjectId(req.params.id || req.body.id);
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid ID format." });
  }
}

module.exports = router;
