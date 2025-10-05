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

export async function getAdvertById(req, res, next) {
  try {
    const advertId = req.params.id;
    const advert = await Advert.findOne({ _id: advertId });

    if (!advert) {
      return res.status(404).json({ error: "Advert not found" });
    }
    res.json(advert);
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
    advert.photo = "/uploads/" + req.file?.filename;
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

    await Advert.findByIdAndDelete(id);

    res.json({ message: "Advert deleted successfully" });
  } catch (error) {
    next(error);
  }
}

export async function deleteMultipleAdverts(req, res, next) {
  try {
    const { advertIds } = req.body;

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
