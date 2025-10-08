// DEPENDENCIES
import { unlink } from "node:fs/promises";
import path from "node:path";
import mongoose from "mongoose";

// NATIVE
import Advert from "../models/Advert.js";
import Category from "../models/Category.js";
import User from "../models/User.js";

export async function getAdverts(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    let sort = req.query.sort || { createdAt: -1, _id: -1 };
    const fields = req.query.fields;

    const filter = {};
    const filterByName = req.query.name;
    const filterByPriceMin = req.query.min;
    const filterByPriceMax = req.query.max;
    const filterByOffer = req.query.offer;
    const filterByCategory = req.query.category;
    const filterByOwner = req.query.owner;

    if (page < 1 || limit < 1 || limit > 20) {
      return res.status(400).json({ error: "Invalid pagination parameters" });
    }

    if (req.query.sort) {
      const [field, dir] = req.query.sort.split(":");
      sort = { [field]: dir === "asc" ? 1 : -1, _id: -1 };
    }

    if (req.query.min && isNaN(req.query.min)) {
      return res.status(400).json({ error: "Invalid min price" });
    }

    if (req.query.max && isNaN(req.query.max)) {
      return res.status(400).json({ error: "Invalid max price" });
    }

    if (filterByName) {
      const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.name = { $regex: escapeRegex(filterByName), $options: "i" };
    }

    if (filterByPriceMin) {
      filter.price = { ...filter.price, $gte: Number(filterByPriceMin) };
    }

    if (filterByPriceMax) {
      filter.price = { ...filter.price, $lte: Number(filterByPriceMax) };
    }

    if (filterByOffer === "true") {
      filter.offer = true;
    } else if (filterByOffer === "false") {
      filter.offer = false;
    }

    if (filterByCategory) {
      const category = Array.isArray(filterByCategory)
        ? filterByCategory
        : filterByCategory.split(",");
      filter.category = { $in: category };
    }

    if (filterByOwner) {
      const user = await User.findOne({ username: filterByOwner });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      filter.owner = user._id;
    }

    const allowedFields = [
      "name",
      "price",
      "category",
      "photo",
      "offer",
      "description",
      "updatedAt",
      "owner",
      "_id",
    ];

    const selectedFields = fields
      ? fields
          .split(",")
          .filter((field) => allowedFields.includes(field))
          .join(" ")
      : allowedFields.join(" ");

    const adverts = await Advert.list(
      filter,
      limit,
      skip,
      sort,
      selectedFields
    );

    const count = await Advert.countDocuments(filter);
    const results = {
      results: adverts,
      total: adverts.length,
      page,
      totalAdverts: count,
      totalPages: Math.ceil(count / limit),
    };

    res.json(results);
  } catch (error) {
    next(error);
  }
}

export async function getAdvertById(req, res, next) {
  try {
    const advertId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(advertId)) {
      return res.status(400).json({ error: "Invalid advert ID format" });
    }

    const advert = await Advert.findById(advertId)
      .populate({
        path: "owner",
        select: "username _id",
        options: { strictPopulate: false },
      })
      .lean();

    if (!advert) {
      return res.status(404).json({ error: "Advert not found" });
    }

    const isOwner =
      req.user && advert.owner && advert.owner._id
        ? advert.owner._id.toString() === req.user.id.toString()
        : false;

    const { _id, username } = advert.owner || {};
    const result = { ...advert, owner: { username }, isOwner };

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getAdvertCategories(req, res, next) {
  try {
    const categories = await Category.find();

    if (!categories || categories.length === 0) {
      return res.status(404).json({ error: "No categories found" });
    }

    res.json(categories);
  } catch (error) {
    next(error);
  }
}

export async function createAdvert(req, res, next) {
  try {
    const advertData = req.body;

    const userId = req.user.id;
    //TODO advert data validation

    // create advert in memory
    const advert = new Advert(advertData);
    if (req.file) {
      advert.photo = "/uploads/" + req.file.filename;
    }

    advert.owner = userId;

    // save advert
    const savedAdvert = await advert.save();

    res.status(201).json({ result: savedAdvert });
  } catch (error) {
    next(error);
  }
}

export async function updateAdvert(req, res, next) {
  try {
    const { id } = req.params;
    const advertData = req.body;

    const advert = await Advert.findById(id);

    if (!advert) {
      return res.status(404).json({ error: "Advert not found" });
    }

    if (advert.owner.toString() !== req.user.id.toString()) {
      return res
        .status(403)
        .json({ error: "Not authorized to update this advert" });
    }

    const updatedAdvert = await Advert.findByIdAndUpdate(id, advertData, {
      new: true,
      runValidators: true,
    });

    res.json({ result: updatedAdvert });
  } catch (error) {
    next(error);
  }
}

export async function deleteAdvert(req, res, next) {
  try {
    const { id } = req.params;

    const advert = await Advert.findById(id);

    if (!advert) {
      return res.status(404).json({ error: "Advert not found" });
    }

    if (advert.owner.toString() !== req.user.id.toString()) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this advert" });
    }

    if (advert.photo) {
      const uploadsDir = path.join(process.cwd(), "uploads");
      const photoPath = path.join(uploadsDir, path.basename(advert.photo));

      try {
        if (path.basename(advert.photo) !== "undefined") {
          await unlink(photoPath);
        }
      } catch (error) {
        console.warn("Could not delete photo:", photoPath);
      }
    }

    await Advert.findByIdAndDelete(id);

    res.json({ message: "Advert deleted successfully" });
  } catch (error) {
    next(error);
  }
}

export async function deleteMultipleAdverts(req, res, next) {
  try {
    const { advertIds } = req.body;

    if (!advertIds.every((id) => mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({ error: "Invalid advert ID format" });
    }

    if (!Array.isArray(advertIds) || advertIds.length === 0) {
      return res.status(400).json({
        error: "advertIds must be a non-empty array",
      });
    }

    const adverts = await Advert.find({
      _id: { $in: advertIds },
    });

    const unauthorizedAdverts = adverts.filter(
      (advert) => advert.owner.toString() !== req.user.id.toString()
    );

    if (unauthorizedAdverts.length > 0) {
      return res.status(403).json({
        error: "Not authorized to delete some of these adverts",
      });
    }

    if (adverts.length !== advertIds.length) {
      return res.status(404).json({
        error: "Some adverts were not found",
      });
    }

    for (const advert of adverts) {
      if (advert.photo) {
        const uploadsDir = path.join(process.cwd(), "uploads");
        const photoPath = path.join(uploadsDir, path.basename(advert.photo));

        try {
          if (path.basename(advert.photo) !== "undefined") {
            await unlink(photoPath);
          }
        } catch (err) {
          console.warn("Could not delete photo:", photoPath);
        }
      }
    }

    const result = await Advert.deleteMany({
      _id: { $in: advertIds },
      owner: req.user.id,
    });

    res.json({
      message: `${result.deletedCount} adverts deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    next(error);
  }
}
