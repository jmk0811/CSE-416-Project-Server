const Certificate = require("../models/Certificate");
const Event = require("../models/Event");
const User = require("../models/User");
const express = require('express');
const router = express.Router();
const {wrapAsync, requireLogin} = require('../helper')
const mongoose = require("mongoose");

/*
 * Certificate
 */

// create certificate
router.post(
	"/certificates",
	requireLogin,
	wrapAsync(async function (req, res) {
		const { issueDate, owner, event, contractAddress } = req.body;
		const certificate = new Event({ issueDate, owner, event, contractAddress });
		await certificate.save();
		res.sendStatus(204);
	}),
);

// update certificate
router.put(
	"/certificates/:id",
	requireLogin,
	wrapAsync(async function (req, res) {
		const { id } = req.params;
		console.log(`PUT with id: ${id}, body: ${JSON.stringify(req.body)}`);
		await User.findByIdAndUpdate(
			id,
			{
				issueDate: req.body.issueDate,
				owner: req.body.owner,
				event: req.body.event,
				contractAddress: req.body.contractAddress,
			},
			{ runValidators: true },
		);
		res.sendStatus(204);
	}),
);

// get all certificates
router.get(
	"/certificates",
	wrapAsync(async function (req, res) {
		const certificate = await Certificate.find({});
		res.json(certificate);
	}),
);

// get certificate by id
router.get(
	"/certificates/:id",
	wrapAsync(async function (req, res) {
		const { id } = req.params;
		if (mongoose.isValidObjectId(id)) {
			const certificate = await Certificate.findById(id);
			if (certificate) {
				res.json(certificate);
			} else {
				throw new Error("Not Found");
			}
		} else {
			throw new Error("Invalid Id");
		}
	}),
);

module.exports = router;