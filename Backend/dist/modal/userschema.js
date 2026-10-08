import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        sparse: true,
        unique: true,
    },
    username: {
        type: String,
        required: false,
    },
    password: { type: Number, required: false },
    passwordHash: { type: String, required: false, select: false },
    role: { type: String, enum: ["admin", "doctor"], default: "doctor", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", default: null },
    refreshTokenHash: { type: String, default: null, select: false },
    refreshTokenExpiresAt: { type: Date, default: null, select: false },
});
const User = mongoose.model("User", userSchema);
export default User;
//# sourceMappingURL=userschema.js.map