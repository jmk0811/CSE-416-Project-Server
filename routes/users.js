const User = require("../models/User");
const express = require('express');
const router = express.Router();
const {wrapAsync, requireLogin} = require('../helper')

/*
 * User
 */

// create user (register)
router.post(
	"/users",
	wrapAsync(async function (req, res) {
		const { name, email, password, type, address1, address2, profileUrl, gender, dateOfBirth, phoneNumber, events, interests } = req.body;
		const user = new User({ name, email, password, type, address1, address2, profileUrl, gender, dateOfBirth, phoneNumber, events, interests });
		await user.save();
		req.session.userId = user._id;
		res.sendStatus(204);
	}),
);

// login
router.post(
	"/login",
	wrapAsync(async function (req, res) {
		const { email, password } = req.body;
		const user = await User.findAndValidate(email, password);
		if (user) {
			req.session.userId = user._id;
			res.sendStatus(204);
		} else {
			res.sendStatus(401);
		}
	}),
);

// logout
router.post(
	"/logout",
	requireLogin,
	wrapAsync(async function (req, res) {
		console.log(req.session.userId);
		req.session.userId = null;
		res.sendStatus(204);
	}),
);

// get all users (admin)
router.get(
	"/users",
	wrapAsync(async function (req, res) {
		const users = await User.find({});
		res.json(users);
	}),
);

// get current user
router.get(
	"/currentuser",
	wrapAsync(async function (req, res) {
		if (req.session.userId === undefined) {
			res.json({});
		} else {
			const currentUser = await User.findById(req.session.userId);
			res.json(currentUser);
		}
	}),
);

// get user by id
router.get(
	"/users/:id",
	wrapAsync(async function (req, res) {
		const { id } = req.params;
		if (mongoose.isValidObjectId(id)) {
			const event = await User.findById(id);
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

// update user
router.put(
	"/users/:id",
	requireLogin,
	wrapAsync(async function (req, res) {
		const { id } = req.params;
		console.log(`PUT with id: ${id}, body: ${JSON.stringify(req.body)}`);
		await User.findByIdAndUpdate(
			id,
			{
				name: req.body.name,
				email: req.body.email,
				password: req.body.password,
				type: req.body.type,
				address1: req.body.address1,
				address2: req.body.address2,
				profileUrl: req.body.profileUrl,
				gender: req.body.gender,
				dateOfBirth: req.body.dateOfBirth,
				phoneNumber: req.body.phoneNumber,
				events: req.body.events,
                interests: req.body.interests,
			},
			{ runValidators: true },
		);
		res.sendStatus(204);
	}),
);

// delete user
router.delete(
	"/users/:id",
	requireLogin,
	wrapAsync(async function (req, res) {
		const { id } = req.params;
		const result = await User.findByIdAndDelete(id);
		console.log(`Deleted successfully: ${result}`);
		res.json(result);
	}),
);

module.exports = router;