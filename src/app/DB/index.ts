import { Gender, UserRole, UserStatus } from "@prisma/client";
import config from "../../config";
import { prisma } from "../../shared";
import { hashedPassword } from "../../helpers/bcryptPassword";

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
    const seedUser = await prisma.user.create({
      data: superAdmin,
    });
    await prisma.admin.create({
      data: {
        userId: seedUser.id,
        fullName: "Super Admin",
        gender: Gender.MALE,
        dateOfBirth: "2000-01-01T00:00:00.000Z",
        avatar:
          "https://res.cloudinary.com/dgxlbj77m/image/upload/v1733261024/urban-mart/profile/admin/super-admin.png",
      },
    });
  }
};

export default seedSuperAdmin;
