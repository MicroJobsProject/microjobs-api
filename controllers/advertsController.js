// NATIVE
import Advert from "../models/Advert.js";

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

    const adverts = await Advert.list(filter, limit, skip, sort, fields);
    const count = await Advert.countDocuments(filter);
    const results = {
      results: adverts,
      total: adverts.length,
      page,
      totalAdverts: count,
      totalPages: Math.ceil(count / limit),
    };

    if (results.page > results.totalPages) {
      res.redirect(`/api/adverts?page=${results.totalPages}`);
    }

    res.json(results);
  } catch (error) {
    next(error);
  }
}
