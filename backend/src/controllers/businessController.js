const prisma =
require("../config/prisma");

const createBusinessProfile =
async(req,res)=>{

try{

const {

businessName,
businessType,
city,
services,
offers,
tone,
phone,
website

}
=
req.body;

const existingProfile =
await prisma.businessProfile
.findUnique({

where:{
userId:req.user.userId
}

});

if(existingProfile){

return res.status(400)
.json({

message:
"Business profile already exists"

});

}

const profile =
await prisma.businessProfile
.create({

data:{

businessName,
businessType,
city,
services,
offers,
tone,
phone,
website,

userId:
req.user.userId

}

});

res.status(201).json({

message:
"Business profile created successfully",

profile

});

}

catch(error){

console.log(error);

res.status(500).json({
message:"Server error"
});

}

};

const getBusinessProfile =
async(req,res)=>{

try{

const profile =
await prisma.businessProfile
.findUnique({

where:{
userId:req.user.userId
}

});

res.status(200).json({

profile

});

}

catch(error){

console.log(error);

res.status(500).json({
message:"Server error"
});

}

};

const updateBusinessProfile =
async(req,res)=>{

try{

const {

businessName,
businessType,
city,
services,
offers,
tone,
phone,
website

}
=
req.body;

const existingProfile =
await prisma.businessProfile
.findUnique({

where:{
userId:req.user.userId
}

});

if(!existingProfile){

return res.status(404)
.json({

message:
"Business profile not found"

});

}

const updatedProfile =
await prisma.businessProfile
.update({

where:{
userId:req.user.userId
},

data:{

businessName,
businessType,
city,
services,
offers,
tone,
phone,
website

}

});

res.status(200).json({

message:
"Business profile updated successfully",

profile:
updatedProfile

});

}

catch(error){

console.log(error);

res.status(500).json({
message:"Server error"
});

}

};

const saveBusinessProfile =
async(req,res)=>{

try{

const {

businessName,
businessType,
city,
services,
offers,
tone,
phone,
website

}
=
req.body;

const existingProfile =
await prisma.businessProfile
.findUnique({

where:{
userId:req.user.userId
}

});

let profile;

if(existingProfile){

profile =
await prisma.businessProfile
.update({

where:{
userId:req.user.userId
},

data:{

businessName,
businessType,
city,
services,
offers,
tone,
phone,
website

}

});

}
else{

profile =
await prisma.businessProfile
.create({

data:{

businessName,
businessType,
city,
services,
offers,
tone,
phone,
website,

userId:
req.user.userId

}

});

}

res.status(200).json({

message:
"Business profile saved successfully",

profile

});

}

catch(error){

console.log(error);

res.status(500).json({
message:"Server error"
});

}

};

const deleteBusinessProfile =
async(req,res)=>{

try{

const existingProfile =
await prisma.businessProfile
.findUnique({

where:{
userId:req.user.userId
}

});

if(!existingProfile){

return res.status(404)
.json({

message:
"Business profile not found"

});

}

await prisma.businessProfile
.delete({

where:{
userId:req.user.userId
}

});

res.status(200).json({

message:
"Business profile deleted successfully"

});

}

catch(error){

console.log(error);

res.status(500).json({
message:"Server error"
});

}

};

module.exports = {

createBusinessProfile,

getBusinessProfile,

updateBusinessProfile,

saveBusinessProfile,

deleteBusinessProfile

};