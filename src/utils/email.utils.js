import nodemailer from 'nodemailer';

export function sendEmail(to, subject, text) {
  let transporter, from;
  if (process.env.NODE_ENV === 'prod') {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });
    from = 'emote@jacobcons.com';
  } else {
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'lilian21@ethereal.email',
        pass: 'myqZ7xnNrcD7uud1B6',
      },
    });
    from = 'lilian21@ethereal.email';
  }

  return transporter.sendMail({
    from,
    to,
    subject,
    text,
  });
}
