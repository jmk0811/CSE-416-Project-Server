const express = require("express");
const Event = require("../models/Event");
const User = require("../models/User");

const router = express.Router();
const { wrapAsync, requireLogin } = require("../helper");
const mongoose = require("mongoose");

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
		await event.save();
		const id = `${event._id}`;
		res.json(id);
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
	requireLogin,
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
