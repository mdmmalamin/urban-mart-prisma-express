import { UserService } from "./user.service";

const createAdmin = async (req: Request, res: Response) => {
  console.log(req)
  const result = await UserService.createAdminIntoDB(req.body);
  return result;
};

export const UserController = {
  createAdmin,
};
