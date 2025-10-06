//DEPENDENCIES
import { sendContactMessageEmail } from "../utils/emailService.js";
import Advert from "../models/Advert.js";

/**
 * SEND CONTACT MESSAGE TO AD OWNER
 */
export const sendContactMessage = async (req, res) => {
  try {
    const { advertId } = req.params;
    const { senderName, senderEmail, message, username } = req.body;

    if (!senderName || !senderEmail || !message) {
      return res.status(400).json({ error: "Faltan campos requeridos" });
    }

    // Obtener anuncio y dueño
    const advert = await Advert.findById(advertId).populate(
      "owner",
      "username email"
    );

    if (!advert || !advert.owner?.email) {
      return res
        .status(404)
        .json({ error: "Anuncio o propietario no encontrado" });
    }

    // Enviar el correo
    await sendContactMessageEmail({
      adTitle: advert.name,
      adOwnerEmail: advert.owner.email,
      senderName,
      senderEmail,
      message,
      username: username || advert.owner.username || "Anónimo",
    });

    res
      .status(200)
      .json({ success: true, message: "Mensaje enviado correctamente" });
  } catch (error) {
    console.error("Error al enviar el mensaje:", error);
    res.status(500).json({ error: "Error al enviar el mensaje de contacto" });
  }
};
