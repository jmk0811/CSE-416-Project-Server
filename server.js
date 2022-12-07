const express = require("express");
const mongoose = require("mongoose");

const server = express();
const bodyParser = require("body-parser");

server.use(bodyParser.json());

const session = require("express-session");
const MongoStore = require("connect-mongo");

// TODO: use env
const dbURL = process.env.MONGO_URL || "mongodb+srv://jmk0811:Ajs67So0RRedoBzO@cluster0.wmdc7up.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(dbURL).then(() => {
	console.log("MongoDB connection successful");
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// Import schema
const User = require("./models/User");
const Event = require("./models/Event");
const Certificate = require("./models/Certificate");

const sessionSecret = "make a secret string";

// Create Mongo DB Session Store
const store = MongoStore.create({
	mongoUrl: dbURL,
	secret: sessionSecret,
	touchAfter: 24 * 60 * 60,
});

// Changing this setting to avoid a Mongoose deprecation warning:
// See: https://mongoosejs.com/docs/deprecations.html#findandmodify
// mongoose.set('useFindAndModify', false);

// Setup to use the express-session package
const sessionConfig = {
	store,
	name: "session",
	secret: sessionSecret,
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
		maxAge: 1000 * 60 * 60 * 24 * 7,
		// secure: true
	},
};

server.use(session(sessionConfig));

function wrapAsync(fn) {
	return function (req, res, next) {
		fn(req, res, next).catch((e) => next(e));
	};
}

server.use((req, res, next) => {
	req.requestTime = Date.now();
	console.log(req.method, req.path);
	next();
});

const requireLogin = (req, res, next) => {
	if (req.session.userId == null) {
		return res.status(401).send("Need to login");
	}
	next();
};

const port = process.env.PORT || 3001;
server.listen(port, () => {
	console.log("server started!");
});

// ************************************************** //

/*
 * User
 */

// create user (register)
server.post(
	"/api/users",
	wrapAsync(async function (req, res) {
		const { name, email, password, type, address1, address2, profileUrl, gender, dateOfBirth, phoneNumber, events } = req.body;
		const user = new User({ name, email, password, type, address1, address2, profileUrl, gender, dateOfBirth, phoneNumber, events });
		await user.save();
		req.session.userId = user._id;
		res.sendStatus(204);
	}),
);

// login
server.post(
	"/api/login",
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
server.post(
	"/api/logout",
	requireLogin,
	wrapAsync(async function (req, res) {
		console.log(req.session.userId);
		req.session.userId = null;
		res.sendStatus(204);
	}),
);

// get all users (admin)
server.get(
	"/api/users",
	wrapAsync(async function (req, res) {
		const users = await User.find({});
		res.json(users);
	}),
);

// get current user
server.get(
	"/api/currentuser",
	wrapAsync(async function (req, res) {
		if (req.session.userId === undefined) {
			res.json({});
		} else {
			const currentUser = await User.findById(req.session.userId);
			res.json(currentUser);
		}
	}),
);

// update user
server.put(
	"/api/users/:id",
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
			},
			{ runValidators: true },
		);
		res.sendStatus(204);
	}),
);

// delete user
server.delete(
	"/api/users/:id",
	requireLogin,
	wrapAsync(async function (req, res) {
		const { id } = req.params;
		const result = await User.findByIdAndDelete(id);
		console.log(`Deleted successfully: ${result}`);
		res.json(result);
	}),
);

// ************************************************** //

/*
 * Event
 */

// create event
server.post(
	"/api/events",
	requireLogin,
	wrapAsync(async function (req, res) {
		const {
			title,
			description,
			holder,
			recruitmentStartDate,
			recruitmentEndDate,
			eventStartDate,
			eventEndDate,
			thumbnail,
			image,
			address,
			point,
			timeSlots: { startTime, endTime, registerLimit, registeredUsers },
		} = req.body;
		const event = new Event({
			title,
			description,
			holder,
			recruitmentStartDate,
			recruitmentEndDate,
			eventStartDate,
			eventEndDate,
			thumbnail,
			image,
			address,
			point,
			timeSlots: { startTime, endTime, registerLimit, registeredUsers },
		});
		await event.save();
		res.sendStatus(204);
	}),
);

// update event
server.put(
	"/api/events/:id",
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
			},
			{ runValidators: true },
		);
		res.sendStatus(204);
	}),
);

// get all events
server.get(
	"/api/events",
	wrapAsync(async function (req, res) {
		const event = await Event.find({});
		res.json(event);
	}),
);

// get event by id
server.get(
	"/api/events/:id",
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

// ************************************************** //

/*
 * Certificate
 */

// create certificate
server.post(
	"/api/certificates",
	requireLogin,
	wrapAsync(async function (req, res) {
		const { issueDate, owner, event, contractAddress } = req.body;
		const certificate = new Event({ issueDate, owner, event, contractAddress });
		await certificate.save();
		res.sendStatus(204);
	}),
);

// update certificate
server.put(
	"/api/certificates/:id",
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
server.get(
	"/api/certificates",
	wrapAsync(async function (req, res) {
		const certificate = await Certificate.find({});
		res.json(certificate);
	}),
);

// get certificate by id
server.get(
	"/api/certificates/:id",
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

// ************************************************** //

