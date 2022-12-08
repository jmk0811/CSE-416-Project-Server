const Event = require("../models/Event");
const User = require("../models/User");
const express = require('express');
const router = express.Router();
const {wrapAsync, requireLogin} = require('../helper')

/*
 * Event
 */

// create event
router.post(
	"/events",
	requireLogin,
	wrapAsync(async function (req, res) {
		const event = new Event({
			title: req.body.title,
			description: req.body.description,
			holder: req.body.holder,
			recruitmentStartDate: req.body.recruitmentStartDate,
			recruitmentEndDate: req.body.recruitmentEndDate,
			eventStartDate: req.body.eventStartDate,
			eventEndDate: req.body.eventEndDate,
			thumbnail: req.body.thumbnail,
			image: req.body.image,
			address: req.body.address,
			point: req.body.point,
			timeSlots: req.body.timeSlots,
            interests: req.body.interests,
		});
		let id;
		await event.save(function (error, event) {
			id = event._id;
			console.log(event._id);
		});
		console.log("id: ", id);
		res.sendStatus(204);
	}),
);

// update event
router.put(
	"/events/:id",
	requireLogin,
	wrapAsync(async function (req, res) {
		const { id } = req.params;
		console.log(`PUT with id: ${id}, body: ${JSON.stringify(req.body)}`);
		await Event.findByIdAndUpdate(
			id,
			{
				title: req.body.title,
				description: req.body.description,
				holder: req.body.holder,
				recruitmentStartDate: req.body.recruitmentStartDate,
				recruitmentEndDate: req.body.recruitmentEndDate,
				eventStartDate: req.body.eventStartDate,
				eventEndDate: req.body.eventEndDate,
				thumbnail: req.body.thumbnail,
				image: req.body.image,
				address: req.body.address,
				point: req.body.point,
				timeSlots: req.body.timeSlots,
                interests: req.body.interests,
			},
			{ runValidators: true },
		);
		res.sendStatus(204);
	}),
);

// get all events
router.get(
	"/events",
	wrapAsync(async function (req, res) {
		const event = await Event.find({});
		res.json(event);
	}),
);

// get event by id
router.get(
	"/events/:id",
	wrapAsync(async function (req, res) {
		const { id } = req.params;
		if (mongoose.isValidObjectId(id)) {
			const event = await Event.findById(id);
			if (event) {
				res.json(event);
			} else {
				throw new Error("Not Found");
			}
		} else {
			throw new Error("Invalid Id");
		}
	}),
);

// delete event
router.delete(
	"/events/:id",
	requireLogin,
	wrapAsync(async function (req, res) {
		const { id } = req.params;
		const result = await User.findByIdAndDelete(id);
		console.log(`Deleted successfully: ${result}`);
		res.json(result);
	}),
);

module.exports = router;