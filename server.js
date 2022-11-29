const express = require("express");
const mongoose = require("mongoose");

const User = require("./models/user");
// const Response = require('./models/response');
// const Question = require('./models/question');
// const Address = require('./models/address');

//
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

const port = process.env.PORT || 5000;
server.listen(port, () => {
	console.log("server started!");
});

/// /////////////////////////////////////////////////////////////////////////////

/*
 * User
 */

// register
server.post(
	"/api/users",
	wrapAsync(async function (req, res) {
		const { name, email, password, address1, address2, profileUrl } = req.body;
		const user = new User({ name, email, password, address1, address2, profileUrl });
		console.log(user);
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
		console.log(email);
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

// get users (admin)
server.get(
	"/api/users",
	wrapAsync(async function (req, res) {
		const users = await User.find({});
		res.json(users);
	}),
);

// get current user (admin)
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
		const { name, email, password, address1, address2, profile_url } = req.body;
		// const addr = new Address({address1, address2})
		// await addr.save();
		const user = await User.findById(id);
		await Address.findByIdAndUpdate(
			user.address,
			{
				address1,
				address2,
			},
			{ runValidators: true },
		);

		console.log(`PUT with id: ${id}, body: ${JSON.stringify(req.body)}`);
		await User.findByIdAndUpdate(
			id,
			{
				name: req.body.name,
				email: req.body.email,
				password: req.body.password,
				address: user.address,
				profile_url: req.body.profile_url,
			},
			{ runValidators: true },
		);
		res.sendStatus(204);
	}),
);

// delete user
server.delete(
	"/api/users/:id",
	wrapAsync(async function (req, res) {
		const { id } = req.params;
		const result = await User.findByIdAndDelete(id);
		console.log(`Deleted successfully: ${result}`);
		res.json(result);
	}),
);

/// ///////////////////////////////////////////////////////////////////////////////
