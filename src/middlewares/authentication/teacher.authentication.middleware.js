import { error } from "../../utills/responseWrapper.js";
import Jwt from "jsonwebtoken";
import { config } from "../../config/config.js";
import { getTeacherService } from "../../services/teacher.services.js";
import { getSectionByIdService } from "../../services/section.services.js";
import { StatusCodes } from "http-status-codes";

export async function teacherAuthenticate(req, res, next) {
  try { 
    const token = req.header("Authorization");
    if (!token) {
      return res.send(error(404, "Authorization token is required!"));
    }
    const parsedToken = token.split(" ")[1];
    const decoded = Jwt.verify(parsedToken, config.accessTokenSecretKey);
    const teacher = await getTeacherService({_id:decoded.teacherId, isActive:true});
    if (!teacher) {
      return res.send(error(404, "Teacher doesn't exists"));
    }
    const section = await getSectionByIdService(teacher["section"])
    if (!section) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Teacher's section not exists"));
    }
    req.teacherId = decoded.teacherId;
    req.sectionId = decoded?.sectionId;
    req.adminId = decoded.adminId;
    next();
  } catch (err) {
    res.send(error(500, err.message));
  }
}