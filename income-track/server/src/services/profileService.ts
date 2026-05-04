import { userRepository } from "../repositories/userRepository.js";
import { comparePassword, hashPassword } from "../utils/password.js";
import { transactionRepository } from "../repositories/transactionRepository.js";

export const profileService = {
  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error("User not found");
    return user;
  },
  async updateProfile(userId: string, patch: { fullName?: string; email?: string }) {
    const user = await userRepository.updateProfile(userId, patch);
    if (!user) throw new Error("User not found");
    return user;
  },
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error("User not found");
    const withPassword = await userRepository.findByEmail(user.email);
    if (!withPassword || !withPassword.password) throw new Error("User not found");
    const ok = await comparePassword(currentPassword, withPassword.password);
    if (!ok) throw new Error("Current password is invalid");
    await userRepository.updatePassword(userId, await hashPassword(newPassword));
  },
  async deleteAccount(userId: string) {
    await transactionRepository.deleteByUserId(userId);
    await userRepository.deleteById(userId);
  }
};
