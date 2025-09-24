// NATIVE
import Advert from "../models/Advert.js";
import Category from "../models/Category.js";
import User from "../models/User.js";

export async function getAdverts(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;

    const filter = {};
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const sort = req.query.sort || "-updatedAt";
    const filterByName = req.query.name;
    const filterByPriceMin = req.query.min;
    const filterByPriceMax = req.query.max;
    const filterByOffer = req.query.offer;
    const filterByCategory = req.query.category;
    const filterByOwner = req.query.owner;
    const fields = req.query.fields;

    if (filterByName) {
      filter.name = { $regex: filterByName, $options: "i" };
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

    const adverts = await Advert.list(filter, limit, skip, sort, fields);
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

export async function getAdvertCategories(req, res, next) {
  try {
    const categories = await Category.find();

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
    advert.image = req.file?.filename;
    advert.owner = userId;

    // save advert
    const savedAdvert = await advert.save();

    res.status(201).json({ result: savedAdvert });
  } catch (error) {
    next(error);
  }
}
