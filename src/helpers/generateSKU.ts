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
