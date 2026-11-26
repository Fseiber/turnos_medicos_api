import { Schema, model } from "mongoose";

const esquemaUser = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
});

export const User = model("User", esquemaUser);
