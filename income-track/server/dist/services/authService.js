import { userRepository } from "../repositories/userRepository.js";
import { comparePassword, hashPassword } from "../utils/password.js";
import { signToken } from "../utils/jwt.js";
export const authService = {
    async signup(input) {
        const existing = await userRepository.findByEmail(input.email);
        if (existing) {
            throw new Error("Email is already in use");
        }
        const password = await hashPassword(input.password);
        const user = await userRepository.create({ ...input, password });
        const token = signToken({ userId: user.id, email: user.email });
        return { user, token };
    },
    async login(input) {
        const user = await userRepository.findByEmail(input.email);
        if (!user || !user.password) {
            throw new Error("Invalid email or password");
        }
        const valid = await comparePassword(input.password, user.password);
        if (!valid)
            throw new Error("Invalid email or password");
        const token = signToken({ userId: user.id, email: user.email });
        return { user, token };
    }
};
