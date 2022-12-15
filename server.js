const express = require("express");
const mongoose = require("mongoose");

const server = express();
const bodyParser = require("body-parser");

server.use(bodyParser.json());

const cors= require('cors')
server.use(cors())

const session = require("express-session");
const MongoStore = require("connect-mongo");

// API Routes
const userRoute = require('./routes/users');
const eventRoute = require('./routes/events');
const certificateRoute = require('./routes/certificates');

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

server.use((req, res, next) => {
	req.requestTime = Date.now();
	console.log(req.method, req.path);
	next();
});


server.use('/api', userRoute);
server.use('/api', eventRoute);
server.use('/api', certificateRoute);

const port = process.env.PORT || 3001;
server.listen(port, () => {
	console.log("server started!");
});
