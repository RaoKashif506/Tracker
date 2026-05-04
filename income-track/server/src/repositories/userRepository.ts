import { Types } from "mongoose";
import { UserModel } from "../models/User.js";

export const userRepository = {
  findByEmail(email: string) {
    return UserModel.findOne({ email }).select("+password");
  },
  findById(id: string) {
    return UserModel.findById(id);
  },
  create(input: { fullName: string; email: string; password: string }) {
    return UserModel.create(input);
  },
  updateProfile(userId: string, input: { fullName?: string; email?: string }) {
    return UserModel.findByIdAndUpdate(new Types.ObjectId(userId), input, { new: true });
  },
  updatePassword(userId: string, password: string) {
    return UserModel.findByIdAndUpdate(new Types.ObjectId(userId), { password }).select("+password");
  },
  deleteById(userId: string) {
    return UserModel.findByIdAndDelete(new Types.ObjectId(userId));
  }
};
