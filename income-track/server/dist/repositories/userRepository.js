import { Types } from "mongoose";
import { UserModel } from "../models/User.js";
export const userRepository = {
    findByEmail(email) {
        return UserModel.findOne({ email }).select("+password");
    },
    findById(id) {
        return UserModel.findById(id);
    },
    create(input) {
        return UserModel.create(input);
    },
    updateProfile(userId, input) {
        return UserModel.findByIdAndUpdate(new Types.ObjectId(userId), input, { new: true });
    },
    updatePassword(userId, password) {
        return UserModel.findByIdAndUpdate(new Types.ObjectId(userId), { password }).select("+password");
    },
    deleteById(userId) {
        return UserModel.findByIdAndDelete(new Types.ObjectId(userId));
    }
};
