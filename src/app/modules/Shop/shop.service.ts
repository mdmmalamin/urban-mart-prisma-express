const getAllShopFromDB = async (query: Record<string, any>) => {
  return {
    meta: {
      page: 1,
      limit: 1,
      total: 1,
    },
    data: "result",
  };
};

export const ShopService = {
  getAllShopFromDB,
};
