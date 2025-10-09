export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      error: messages[0] || "Validation error",
      field: Object.keys(err.errors)[0],
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      error: "Invalid ID format",
      field: err.path,
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      error: `${field} already exists`,
      field,
    });
  }

  if (
    err.name === "MongoNetworkError" ||
    err.name === "MongooseServerSelectionError"
  ) {
    return res.status(503).json({
      error: "Database connection error. Please try again later.",
    });
  }

  const statusCode =
    err.status || (res.statusCode !== 200 ? res.statusCode : 500);
  res.status(statusCode).json({
    error: err.message || "Internal server error",
    ...(err.field && { field: err.field }),
  });
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: `Route ${req.originalUrl} not found`,
  });
};
