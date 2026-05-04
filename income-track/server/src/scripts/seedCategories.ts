import { connectDb } from "../db/mongoose.js";
import { categoryRepository } from "../repositories/categoryRepository.js";

const defaults = [
  { name: "Food", type: "expense" as const, color: "#EF4444", icon: "utensils" },
  { name: "Transport", type: "expense" as const, color: "#3B82F6", icon: "car" },
  { name: "Utilities", type: "expense" as const, color: "#8B5CF6", icon: "bolt" },
  { name: "Salary", type: "income" as const, color: "#10B981", icon: "wallet" },
  { name: "Freelance", type: "income" as const, color: "#14B8A6", icon: "briefcase" }
];

async function run() {
  await connectDb();
  const count = await categoryRepository.count();
  if (count > 0) {
    console.log("Categories already exist, skipping seed.");
    return;
  }
  await categoryRepository.insertMany(defaults);
  console.log(`Seeded ${defaults.length} categories.`);
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
  });
