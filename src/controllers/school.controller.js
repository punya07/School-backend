import schoolModel from "../models/school.model.js";
import generateAccessToken from "../services/generateAccessToken.js";
import { error, success } from "../utills/responseWrapper.js";
import bcrypt from 'bcrypt';
import { checkSchoolExist, createSchool, findSchoolByAdminName } from "../services/school.services.js";

export async function registerController(req,res){
    try {
        const{name,affiliationNo,address,email,phone,adminName,password} = req.body;

        if(!name || !affiliationNo || !address || !email ||!phone || !adminName || !password){
            return res.send(error(400,"all fields are required!"));
        }

        // const existingSchool = await schoolModel.findOne({$or :[{adminName},{email}]});
        const existingSchool = await checkSchoolExist(adminName,email);


        if(existingSchool&& existingSchool?.adminName===adminName){
            return res.send(error(400,"admin name already exist"));
        }
        if(existingSchool&& existingSchool?.email===email){
            return res.send(error(400,"email already exist"));
        }

        const hashedPassword = await bcrypt.hash(password,11);
        
        // todo: verify affiliation
        
        // const school = await schoolModel.create({name,affiliationNo,address,email,phone,adminName,"password":hashedPassword});
        const school = await createSchool(name,affiliationNo,address,email,phone,adminName,hashedPassword);
        // console.log(school);
        return res.send(success(201,"School registered successfully!"));
        
    } catch (err) {
        return res.send(error(500,err.message));
    }
}


export async function loginController(req,res){
    try {
        console.log("login called")
        const {adminName , password} = req.body;
        if(!adminName || !password){
            return res.send(error(400,"all fields are required!"));
        }

        // const school = await schoolModel.findOne({adminName});
        const school = await findSchoolByAdminName(adminName);
        if(!school){
            return res.send(error(404,"admin name is not registered!"));
        }
        console.log({password,p:school.password})
        const matchPassword = await bcrypt.compare(password,school.password);
        if(!matchPassword){
            return res.send(error(404,"incorrect password"));
        }
        const accessToken = generateAccessToken({...school});
        return res.send(success(200,{accessToken}));
        
    } catch (err) {
        // console.log(err)
        return res.send(error(500,err.message));
        
    }
}