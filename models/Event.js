const mongoose = require("mongoose");

const { Schema } = mongoose;

// volunteer work
const EventSchema = new Schema({
	title: { type: String, required: true },
	description: { type: String, required: true },
	holder: { type: Schema.Types.ObjectID, ref: "Organization", required: true },
	recruitmentStartDate: { type: Date, required: true },
	recruitmentEndDate: { type: Date, required: true },
	eventStartDate: { type: Date, required: true },
	eventEndDate: { type: Date, required: true },
	thumbnail: { type: String },
	image: { type: String },
	address: { type: String },
	interests: [{ type: String, required: false }],
	point: { type: Number, required: true },
	timeSlots: [
		{
			startTime: { type: Date },
			endTime: { type: Date },
			registerLimit: { type: Number },
			registeredUsers: [{ type: Schema.Types.ObjectID, ref: "User" }],
		},
	],
});

module.exports = mongoose.model("Event", EventSchema);
