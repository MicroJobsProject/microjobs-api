// DEPENDENCIES
import { sendContactMessageEmail } from "../utils/emailService.js";
import Advert from "../models/Advert.js";

/**
 * SEND CONTACT MESSAGE TO AD OWNER
 */
export const sendContactMessage = async (req, res) => {
  try {
    const { advertId } = req.params;
    const { senderName, senderEmail, subject, message, username } = req.body;

    if (!senderName || !senderEmail || !subject || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get advert and owner
    const advert = await Advert.findById(advertId).populate(
      "owner",
      "username email"
    );

    if (!advert || !advert.owner?.email) {
      return res.status(404).json({ error: "Advert or owner not found" });
    }

    // Send the email
    await sendContactMessageEmail({
      adTitle: advert.name,
      adOwnerEmail: advert.owner.email,
      senderName,
      senderEmail,
      subject,
      message,
      username: username || advert.owner.username || "Anonymous",
    });

    res
      .status(200)
      .json({ success: true, message: "Message sent successfully" });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Error sending contact message" });
  }
};
