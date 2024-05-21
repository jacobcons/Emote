import nodemailer from 'nodemailer';

export function sendEmail(to, subject, text) {
  let options, from;
  if (process.env.NODE_ENV === 'prod') {
    options = {
      host: 'smtppro.zoho.eu',
      port: 465,
      auth: {
        user: process.env.ZOHO_USER,
        pass: process.env.ZOHO_PASS,
      },
    };
    from = 'emote@jacobcons.com';
  } else {
    options = {
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'lilian21@ethereal.email',
        pass: 'myqZ7xnNrcD7uud1B6',
      },
    };
    from = 'lilian21@ethereal.email';
  }

  const transporter = nodemailer.createTransport(options);
  return transporter.sendMail({
    from,
    to,
    subject,
    text,
  });
}
