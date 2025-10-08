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

  const logoUrl =
    "https://raw.githubusercontent.com/MicroJobsProject/microjobs/0c9f37c258394f3317c8434e6568cfd8feaf8385/src/assets/microjobs.svg";

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
      <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color:#f9fafb; padding:24px;">
        <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:12px; padding:24px; box-shadow:0 2px 4px rgba(0,0,0,0.05);">
          <div style="text-align:center; margin-bottom:20px;">
            <img src="${logoUrl}" alt="${
      process.env.APP_NAME || "MicroJobs"
    }" width="120" style="display:inline-block; object-fit:contain;" />
          </div>
          <h2 style="color:#0f172a; font-size:20px; margin:0 0 16px;">Password Reset Request</h2>
        <p style="font-size:15px; color:#334155;">Hi <strong>${username}</strong>,</p>
        <p style="font-size:15px; color:#334155;">You requested to reset your password. Click the button below:</p>
        <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background-color:#917127;color:white;text-decoration:none;border-radius:4px;margin:20px 0;">Reset Password</a>
        <p style="margin:10px 0 8px; font-size:15px; color:#334155;">Or copy this link:</p>
        <p style="background:#f1f5f9; border-radius:8px; padding:16px; font-size:14px; color:#1e293b; line-height:1.5; word-break:break-all;">${resetUrl}</p>
        <p style="margin-bottom:16px; font-size:14px; color:#475569;"><strong>This link expires in ${expirationText}.</strong></p>
        <p style="margin-top:20px; font-size:12px; color:#666;">
            This message was sent via <strong>${
              process.env.APP_NAME || "MicroJobs"
            }</strong>.  
            If you believe this is an error, you can safely ignore it.
          </p>
        <hr style="margin:30px 0;border:none;border-top:1px solid #ccc;">
        <p style="color:#666;font-size:12px;">${
          process.env.APP_NAME || "MicroJobs"
        } - ${new Date().getFullYear()}</p>
        </div>
      </div>
    `,
    text: `
      Password Reset Request
      \n\n
      Hi ${username},
      \n\n
      Reset your password here: ${resetUrl}
      \n\n
      This link expires in ${expirationText}.
      \n\n
      If you didn't request this, ignore this email.
      \n\n
      Sent via MicroJobs.
    `,
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
  subject,
  message,
  username,
}) {
  const transporter = await getTransporter();

  const logoUrl =
    "https://raw.githubusercontent.com/MicroJobsProject/microjobs/0c9f37c258394f3317c8434e6568cfd8feaf8385/src/assets/microjobs.svg";

  const mailOptions = {
    from: `${process.env.APP_NAME || "MicroJobs"} <${
      process.env.EMAIL_USER || "no-reply@microjobs.test"
    }>`,
    replyTo: `${senderName} <${senderEmail}>`,
    to: adOwnerEmail,
    subject: `New Contact Message - ${process.env.APP_NAME || "MicroJobs"}`,
    html: `
      <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color:#f9fafb; padding:24px;">
        <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:12px; padding:24px; box-shadow:0 2px 4px rgba(0,0,0,0.05);">
          <div style="text-align:center; margin-bottom:20px;">
            <img src="${logoUrl}" alt="${
      process.env.APP_NAME || "MicroJobs"
    }" width="120" style="display:inline-block; object-fit:contain;" />
          </div>
          <h2 style="color:#0f172a; font-size:20px; margin:0 0 16px;">📬 Someone sent you a message!</h2>
          
          <p style="margin:0 0 8px; font-size:15px; color:#334155;">
            You’ve received a new message regarding your advert:
          </p>
          <p style="margin:0 0 16px; font-weight:600; color:#917127; font-size:16px;">
            “${adTitle}”
          </p>

          <table style="width:100%; margin-bottom:16px; font-size:14px; color:#475569;">
            <tr><td style="padding:4px 0;"><strong>From:</strong> ${
              username || senderName
            }</td></tr>
            <tr><td style="padding:4px 0;"><strong>Reply To:</strong> Simply use the function "Reply" in your Email client.</td></tr>
            <tr><td><hr style="margin:22px 0;border:none;border-top:1px solid #ccc;"></td></tr>
            <tr><td style="padding:4px 0;"><strong>Subject:</strong> ${subject}</td></tr>
          </table>
          <div style="background:#f1f5f9; border-radius:8px; padding:16px; font-size:14px; font-style:italic; color:#1e293b; line-height:1.5; word-break:break-all;">
            ${message}
          </div>

          <p style="margin-top:20px; font-size:12px; color:#666;">
            This message was sent via <strong>${
              process.env.APP_NAME || "MicroJobs"
            }</strong>.  
            If you believe this is an error, you can safely ignore it.
          </p>
          <hr style="margin:30px 0;border:none;border-top:1px solid #ccc;">
          <p style="color:#666;font-size:12px;">
              © ${
                process.env.APP_NAME || "MicroJobs"
              } - ${new Date().getFullYear()}
          </p>
        </div>
      </div>
    `,
    text: `
      New message for your advert "${adTitle}"
      \n\n
      From: ${username || senderName}\n
      Subject: ${subject}\n
      \n\n
      Message:\n
      ${message}
      \n\n
      Reply directly to this email to contact the sender.
      \n\n
      If you didn't request this, ignore this email.
      \n\n
      Sent via MicroJobs.
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Contact message sent to:", adOwnerEmail);
    return info;
  } catch (error) {
    console.error("Error sending contact message:", error);
    throw error;
  }
}
