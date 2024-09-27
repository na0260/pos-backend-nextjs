import nodemailer from "nodemailer";

export async function SendEmail(To, Subject, Content) {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    const mailOptions = {
        from: process.env.SMTP_USER,
        to: To,
        subject: Subject,
        text: Content
    };

    return await transporter.sendMail(mailOptions);

}