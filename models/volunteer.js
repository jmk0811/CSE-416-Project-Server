const mongoose = require("mongoose");

const { Schema } = mongoose;

const VolunteerSchema = new Schema({
	title: { type: String, required: true },
	description: { type: String, required: true },
});

module.exports = mongoose.model("Volunteer", VolunteerSchema);
