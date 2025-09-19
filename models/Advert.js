//DEPENDENCIES
import { Schema, model } from "mongoose";

const advertSchema = new Schema(
  {
    name: { type: String, maxLength: 80, required: true },
    owner: {
      ref: "User",
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    price: { type: Number, required: true, min: 0, max: 99999 },
    offer: { type: Boolean, required: true },
    description: { type: String, maxLength: 640, required: true },
    category: { type: String, required: true },
    photo: { type: String },
  },
  { collections: "adverts", timestamps: true }
);

/**
 * LIST ADVERTS
 */
advertSchema.statics.list = function (filter, limit, skip, sort, fields) {
  const query = Advert.find(filter).populate("owner", "username");

  query.limit(limit);
  query.skip(skip);
  query.sort(sort);
  query.select(fields);

  return query.exec();
};

const Advert = model("Advert", advertSchema);

export default Advert;
