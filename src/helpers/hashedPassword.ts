import bcrypt from "bcrypt";
import config from "../config";

export const hashedPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(
    password as string,
    Number(config.bcrypt.salt_rounds)
  );
};
