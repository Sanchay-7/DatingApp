import nodemailer from "nodemailer";

const testAccount = await nodemailer.createTestAccount();

const transporter = nodemailer.createTransport({
  host: testAccount.smtp.host,
  port: testAccount.smtp.port,
  secure: testAccount.smtp.secure,
  auth: {
    user: testAccount.user,
    pass: testAccount.pass,
  },
});

const info = await transporter.sendMail({
  from: '"Test" <test@example.com>',
  to: "someone@example.com",
  subject: "Hello",
  text: "Testing email",
});

console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
