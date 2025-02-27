import mongoose from "mongoose";

const superAdminSchema = mongoose.Schema({
  username:{
    type: String,
    required:true
  },
  email:{
    type: String,
    required:true
  },
  password:{
    type: String,
    required:true
  }
});


const superAdminModel = mongoose.model("superAdmin", superAdminSchema);
export default superAdminModel;