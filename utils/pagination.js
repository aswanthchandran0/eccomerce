async function paginate(model, query = {}, options = {}) {
  const page = parseInt(options.page) || 1;
  const limit = parseInt(options.limit) || 10;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    model.find(query)
      .sort(options.sort || { createdAt: -1 })
      .skip(skip)
      .limit(limit),
    model.countDocuments(query)
  ]);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}

module.exports = paginate;
