const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", 
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

const sendWelcomeEmail = async (to, doctorName) => {
  const mailOptions = {
    from: '"Tu Plataforma" <tuemail@gmail.com>',
    to,
    subject: "Alta confirmada en la plataforma",
    html: `
      <h2>¡Bienvenido/a, Dr. ${doctorName}!</h2>
      <p>Tu alta en la plataforma ha sido aceptada. Ya puedes acceder a todas las funcionalidades con tu cuenta.</p>
      <p>Gracias por unirte a nuestro equipo.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendWelcomeEmail };
