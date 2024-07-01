import {generateAccessToken,generateRefreshToken} from "../services/JWTToken.service.js";
import { error, success } from "../utills/responseWrapper.js";
import bcrypt from "bcrypt";
import {checkAdminExist,createAdmin,findAdminByAdminName,findAdminByEmail} from "../services/admin.services.js";
import { hashPassword } from "../services/password.service.js";

export async function registerAdminController(req, res) {
  try {
    const {schoolName,affiliationNo,address,email,phone,adminName,password} = req.body;

    const existingSchool = await checkAdminExist(adminName, email,affiliationNo);

    if (existingSchool && existingSchool?.adminName === adminName) {
      return res.send(error(400, "admin name already exist"));
    }
    if (existingSchool && existingSchool?.email === email) {
      return res.send(error(400, "email already exist"));
    }
    if (existingSchool && existingSchool?.affiliationNo === affiliationNo) {
      return res.send(error(400, "affiliationNo already exist"));
    }

    const hashedPassword = await hashPassword(password);
    const admin = await createAdmin(schoolName,affiliationNo,address,email,phone,adminName,hashedPassword);
    if (admin instanceof Error) {
      return res.send(error(400, "admin couldn't be registered"));
    }
    return res.send(success(201, "admin registered successfully!"));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function loginAdminController(req, res) {
  try {
    const { email, password } = req.body;
    const admin = await findAdminByEmail(email);
    if (!admin) {
      return res.send(error(404, "unauthorized user"));
    }
    const matchPassword = await bcrypt.compare(password, admin.password);
    if (!matchPassword) {
      return res.send(error(404, "unauthorized user"));
    }
    const accessToken = generateAccessToken({role: "admin",adminId: admin["_id"],phone: admin["phone"]});
    const refreshToken = generateRefreshToken({role: "admin",adminId: admin["_id"],phone: admin["phone"]});
    res.cookie("jwt", refreshToken);
    return res.send(success(200, { accessToken,username:admin.adminName}));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}