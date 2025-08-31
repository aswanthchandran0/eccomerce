const Brand = require('../models/BrandModel')
const mockBrands = require('../mock/brand')
const paginate = require("../utils/pagination")

async function getBrands({ page = 1, limit = 8 }){
    if(process.env.USE_MOCK_DATA === 'true'){
  // Simulate pagination for mock data
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = mockBrands.slice(startIndex, endIndex);
    
    return {
      data: paginatedData,
      pagination: {
        total: mockBrands.length,
        page,
        limit,
        totalPages: Math.ceil(mockBrands.length / limit)
      }
    };
    }
    return await paginate(Brand, {}, { page, limit, sort: { updatedAt: -1 } })
}

module.exports = { getBrands };