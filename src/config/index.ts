import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  bcrypt: {
    salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  },
  jwt: {
    access_secret: process.env.JWT_ACCESS_SECRET,
    access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
    refresh_secret: process.env.JWT_REFRESH_SECRET,
    refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
    reset_password_secret: process.env.JWT_RESET_PASSWORD_SECRET,
    reset_password_expires_in: process.env.JWT_RESET_EXPIRES_IN,
  },
  resetPassLink: process.env.RESET_PASS_LINK,
  sendEmail: {
    email: process.env.EMAIL,
    app_pass: process.env.APP_PASS,
  },
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  },
  superAdmin: {
    email: process.env.SUPER_ADMIN_EMAIL,
    password: process.env.SUPER_ADMIN_PASSWORD,
    phone: process.env.SUPER_ADMIN_PHONE,
  },
};
