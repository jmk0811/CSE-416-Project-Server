const mongoose = require("mongoose");

const { Schema } = mongoose;

const CertificateSchema = new Schema({
	// certificateId: { type: Number, required: true, unique: true }, // _id field will is used instead
	issueDate: { type: Date, required: true }, // same as user's event completion date
	owner: { type: Schema.Types.ObjectID, ref: "User" },
	event: { type: Schema.Types.ObjectID, ref: "Event" },
	contractAddress: { type: String }, // access to blockchain
});

module.exports = mongoose.model("Certificate", CertificateSchema);
