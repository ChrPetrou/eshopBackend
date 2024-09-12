import NodeMailer from "nodemailer";
import { env } from "process";

const emailService = {
  send2FaEmail: async (email: string, code: string): Promise<Boolean> => {
    try {
      const transporter = NodeMailer.createTransport({
        host: "smtp.office365.com",
        port: 587,
        secure: false, // STARTTLS
        auth: {
          user: process.env.AUTH_EMAIL,
          pass: process.env.AUTH_PASSWORD,
        },
      });

      const html = `
      <p>To complete the sign in/register,enter the verification code below</p>
        <p>Verification code: <strong>${code}</strong></p>
      `;
      //
      const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: "chrispetrou17@gmail.com",
        subject: "Two-Factor Authentication Required",
        html: html,
      };
      await transporter.sendMail(mailOptions);
    } catch (err) {
      console.log(err);
      return false;
    }

    return true;
  },
};

export default emailService;
