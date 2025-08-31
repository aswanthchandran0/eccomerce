const Banner = require('../models/bannerModel')
const mockBanners = require('../mock/banner');
const paginate = require('../utils/pagination');

async function  getBanner({ page = 1, limit = 8 }) {
      if(process.env.USE_MOCK_DATA === 'true'){
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = mockBanners.slice(startIndex, endIndex);
    
    return {
      data: paginatedData,
      pagination: {
        total: mockBanners.length,
        page,
        limit,
        totalPages: Math.ceil(mockBanners.length / limit)
      }
    };
    }
    return await paginate(Banner,{}, { page, limit, sort: { updatedAt: -1 }})
}

module.exports = { getBanner };