import { StockAction } from "@prisma/client";
import ApiError from "../app/errors/ApiError";
import { httpStatus } from "../shared";

export const stockAction = (
  actionType: StockAction,
  quantityChange: number
) => {
  let stock = {
    quantityChanged: 0,
    newQuantity: 0,
    lastQuantity: 0,
  };

  stock.quantityChanged = quantityChange;

  switch (actionType) {
    case "INITIAL":
      stock.newQuantity = stock.quantityChanged;
      break;

    case "RESTOCK":
      stock.lastQuantity = stock.newQuantity;
      stock.newQuantity = stock.newQuantity + stock.quantityChanged;
      break;

    case "SALE":
      stock.lastQuantity = stock.newQuantity;
      stock.newQuantity = stock.newQuantity - stock.quantityChanged;
      break;

    case "RETURN":
      stock.lastQuantity = stock.newQuantity;
      stock.newQuantity = stock.newQuantity + stock.quantityChanged;
      break;

    case "ADJUSTMENT":
      stock.lastQuantity = stock.newQuantity;
      stock.newQuantity = stock.newQuantity - stock.quantityChanged;
      break;

    default:
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Unknown actionType: ${actionType}`
      );
  }

  return stock;
};
