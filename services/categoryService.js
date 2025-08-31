const Brand = require('../models/catagoryModel')
const mockCategory = require('../mock/category')
const paginate = require("../utils/pagination")

async function getCategory({ page = 1, limit = 8 }){
    if(process.env.USE_MOCK_DATA === 'true'){
        // Simulate pagination for mock data
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = mockCategory.slice(startIndex, endIndex);
    
    return {
      data: paginatedData,
      pagination: {
        total: mockCategory.length,
        page,
        limit,
        totalPages: Math.ceil(mockCategory.length / limit)
      }
    };
    }
    return await paginate(Brand, {}, { page, limit, sort: { updatedAt: -1 } })
}

module.exports = { getCategory };