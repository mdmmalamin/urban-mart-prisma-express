export const generateSku = async (
  shopName: string,
  category: string,
  productId: string
): Promise<string> => {
  const vendorCode = shopName.slice(0, 3).toUpperCase(); //? First 3 letters of vendor name
  const categoryCode = category.slice(0, 3).toUpperCase(); //? First 3 letters of category
  const productCode = productId.slice(0, 8).toUpperCase(); //? First 8 letters of product id

  return await `${vendorCode}-${categoryCode}-${productCode}`;
};

export const generateFolder = async (
  name: string,
  id: string
): Promise<string> => {
  const nameCode = name.slice(0, 3).toUpperCase(); //? First 3 letters of vendor name
  const idCode = id.slice(0, 8).toUpperCase(); //? First 8 letters of product id

  return await `${nameCode}-${idCode}`;
};
