import nodemailer from "nodemailer";
import config from "../config";

export const sendEmail = async (
  email: string,
  subject: string,
  html: string
) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, //? true for port 465, false for other ports
    auth: {
      user: config.sendEmail.email,
      pass: config.sendEmail.app_pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  //? send mail with defined transport object
  const info = await transporter.sendMail({
    from: `"Urban Mart" <${config.sendEmail.email}>`, //? sender address
    to: email,
    subject: subject,
    html: html,
  });
  console.log(email);

  console.log("Message sent: %s", info.messageId);
};
