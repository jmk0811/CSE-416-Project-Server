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
	address: { type: String, required: true },
	// interests: [{ type: String, required: false }], // ?
	point: { type: Number, required: true },
	timeSlots: [ // working days
		{
			startTime: { type: Date, required: true },
			endTime: { type: Date, required: true },
			registerLimit: { type: Number },
			// occupy: { type: Number }, // ?
			registeredUsers: [{ type: Schema.Types.ObjectID, ref: "User" }],
		},
	],
});

/*
const example = {
	title: "trash picking",
	company: "Samsung",
	description: "This is a volunteering to pick up trash in Hangang",
	fileURL: "https://www.cloudinary/files/324132",
	recruitmentStart: new Date("2022-12-07"),
	recruitmentEnd: new Date("2022-12-11"),
	volunteeringStart: new Date("2022-12-11"),
	volunteeringEnd: new Date("2022-12-13"),
	address: "68, Yeouigongwon-ro, Yeongdeungpo-gu, Seoul",
	interest: ["environment", "healthcare"],
	point: 100,
	workingDays: [
		{
			date: new Date("2022-12-11 14:00"),
			numberOfRegistered: 10,
			occupy: 1,
			registeredUsers: [
				{
					name: "James",
					phone: "010-1234-5678",
					emailAddress: "james@gmail.com",
					// ...
				},
			],
		},
		{
			date: new Date("2022-12-12 14:00"),
			numberOfRegistered: 10,
			occupy: 2,
			registeredUsers: [
				{
					name: "John",
					phone: "010-2345-6789",
					emailAddress: "john123@gmail.com",
					// ...
				},
				{
					name: "Chris",
					phone: "010-5434-4234",
					emailAddress: "chris232@gmail.com",
					// ...
				},
			],
		},
		{
			date: new Date("2022-12-13 14:00"),
			numberOfRegistered: 10,
			occupy: 0,
			registeredUsers: [],
		},
	],
};
*/

module.exports = mongoose.model("Event", EventSchema);
