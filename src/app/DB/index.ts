import { UserRole, UserStatus } from "@prisma/client";
import config from "../../config";
import { prisma } from "../../shared";
import { hashedPassword } from "../../helpers/hashedPassword";

const seedSuperAdmin = async () => {
  const superAdmin = {
    email: config.superAdmin.email as string,
    phone: config.superAdmin.phone as string,
    password: await hashedPassword(config.superAdmin.password as string),
    role: UserRole.SUPER_ADMIN,
    status: UserStatus.ACTIVE,
    passwordChangedAt: new Date(),
  };

  //? when database is connected, we will check is there any user who is super admin
  const isSuperAdminExits = await prisma.user.findFirst({
    where: {
      role: "SUPER_ADMIN",
    },
  });
  if (!isSuperAdminExits) {
    await prisma.user.create({
      data: superAdmin,
    });
  }
};

export default seedSuperAdmin;
