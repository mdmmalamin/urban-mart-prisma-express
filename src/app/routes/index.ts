import express from "express";
import { UserRoute } from "../modules/User/user.route";
import { AuthRoutes } from "../modules/Auth/auth.route";
import { CategoryRoutes } from "../modules/Category/category.route";
import { VendorRoutes } from "../modules/Vendor/vendor.route";
import { AddressRoutes } from "../modules/Address/address.route";
import { AdminRoutes } from "../modules/Admin/admin.route";
import { CartRoutes } from "../modules/Cart/cart.route";
import { CustomerRoutes } from "../modules/Customer/customer.route";
import { DiscountRoutes } from "../modules/Discount/discount.route";
import { FollowRoutes } from "../modules/Follow/follow.route";
import { HistoryRoutes } from "../modules/History/history.route";
import { InventoryRoutes } from "../modules/Inventory/inventory.route";
import { OrderRoutes } from "../modules/Order/order.route";
import { PaymentRoutes } from "../modules/Payment/payment.route";
import { ProductRoutes } from "../modules/Product/product.route";
import { ReviewRoutes } from "../modules/Review/review.route";
import { ShopRoutes } from "../modules/Shop/shop.route";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/users",
    route: UserRoute,
  },
  {
    path: "/customers",
    route: CustomerRoutes,
  },
  {
    path: "/admins",
    route: AdminRoutes,
  },
  {
    path: "/vendors",
    route: VendorRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/shops",
    route: ShopRoutes,
  },
  {
    path: "/categories",
    route: CategoryRoutes,
  },
  {
    path: "/inventories",
    route: InventoryRoutes,
  },
  {
    path: "/inventory-histories",
    route: HistoryRoutes,
  },
  {
    path: "/products",
    route: ProductRoutes,
  },
  {
    path: "/carts",
    route: CartRoutes,
  },
  {
    path: "/orders",
    route: OrderRoutes,
  },
  {
    path: "/payments",
    route: PaymentRoutes,
  },
  {
    path: "/reviews",
    route: ReviewRoutes,
  },
  {
    path: "/discounts",
    route: DiscountRoutes,
  },
  {
    path: "/follows",
    route: FollowRoutes,
  },
  {
    path: "/addresses",
    route: AddressRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
