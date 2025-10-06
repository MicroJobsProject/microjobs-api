import nodemailer from "nodemailer";

let transporter;

export async function getTransporter() {
  if (transporter) return transporter;

  const provider =
    process.env.MAILER_PROVIDER ||
    (process.env.NODE_ENV === "production" ? "smtp" : "mailtrap");

  if (provider === "mailtrap") {
    transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: Number(process.env.MAILTRAP_PORT) || 587,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    });
  } else if (provider === "smtp") {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    throw new Error("Invalid MAILER_PROVIDER. Use 'mailtrap' or 'smtp'.");
  }

  transporter.verify((error) => {
    if (error) {
      console.error("Email service error:", error.message);
      console.error("Check credentials in .env file");
    } else {
      console.log(`Email service ready (${provider})`);
    }
  });

  return transporter;
}

export async function sendPasswordResetEmail({ email, username, resetUrl }) {
  if (!process.env.EMAIL_USER && process.env.MAILER_PROVIDER === "smtp") {
    console.log("\n========================================");
    console.log("SIMULATED EMAIL (Configure Gmail in .env)");
    console.log("========================================");
    console.log("To:", email);
    console.log("RESET URL:");
    console.log(resetUrl);
    console.log("========================================\n");
    return { messageId: "simulated" };
  }

  const transporter = await getTransporter();

  const expirationHours =
    parseInt(process.env.PASSWORD_RESET_TOKEN_EXPIRATION_HOURS) || 1;
  const expirationText =
    expirationHours === 1 ? "1 hour" : `${expirationHours} hours`;

  const mailOptions = {
    from: `${process.env.APP_NAME || "MicroJobs"} <${
      process.env.EMAIL_USER || "no-reply@microjobs.test"
    }>`,
    to: email,
    subject: `Password Reset - ${process.env.APP_NAME || "MicroJobs"}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Hi ${username},</p>
        <p>You requested to reset your password. Click the button below:</p>
        <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background-color:#917127;color:white;text-decoration:none;border-radius:4px;margin:20px 0;">Reset Password</a>
        <p>Or copy this link:</p>
        <p style="background:#f0f0f0;padding:10px;word-break:break-all;">${resetUrl}</p>
        <p><strong>This link expires in ${expirationText}.</strong></p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr style="margin:30px 0;border:none;border-top:1px solid #ccc;">
        <p style="color:#666;font-size:12px;">${
          process.env.APP_NAME || "MicroJobs"
        } - ${new Date().getFullYear()}</p>
      </div>
    `,
    text: `Password Reset Request\n\nHi ${username},\n\nReset your password here: ${resetUrl}\n\nThis link expires in ${expirationText}.\n\nIf you didn't request this, ignore this email.`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent to:", email);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

/**
 * SEND CONTACT MESSAGE TO AD OWNER
 */

export async function sendContactMessageEmail({
  adTitle,
  adOwnerEmail,
  senderName,
  senderEmail,
  message,
  username,
}) {
  const transporter = await getTransporter();

  const mailOptions = {
    from: `${senderName} <${senderEmail}>`,
    to: adOwnerEmail,
    subject: `Usuario ${username} te mandó un mensaje por "${adTitle}"`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Nuevo mensaje de contacto</h2>
        <p><strong>Nombre:</strong> ${senderName}</p>
        <p><strong>Email:</strong> ${senderEmail}</p>
        <hr>
        <p><strong>Mensaje:</strong></p>
        <p style="background:#f9f9f9;padding:15px;border-radius:6px;">${message}</p>
        <hr>
        <p style="color:#666;font-size:12px;">Este mensaje fue enviado desde el formulario de contacto del anuncio "${adTitle}".</p>
      </div>
    `,
    text: `Nuevo mensaje de contacto\n\nDe: ${senderName} (${senderEmail})\n\nAnuncio: ${adTitle}\n\nMensaje:\n${message}`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Mensaje de contacto enviado a:", adOwnerEmail);
    return info;
  } catch (error) {
    console.error("Error enviando mensaje de contacto:", error);
    throw error;
  }
}
