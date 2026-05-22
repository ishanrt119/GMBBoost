const prisma =
require("../config/prisma");

const bcrypt =
require("bcryptjs");

const jwt =
require("jsonwebtoken");

const validator =
require("validator");

const crypto =
require("crypto");

const registerUser =
async(req,res)=>{

try{

const {
name,
email,
password
} = req.body;

if(
!name ||
!email ||
!password
){

return res.status(400)
.json({
message:
"All fields required"
});

}

if(
!validator.isEmail(email)
){

return res.status(400)
.json({
message:
"Invalid email format"
});

}

const strongPassword =
/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;

if(
password.length < 8 ||
!strongPassword.test(password)
){

return res.status(400)
.json({
message:
"Password must contain uppercase, lowercase, number and special character"
});

}

const existingUser =
await prisma.user.findUnique({

where:{
email
}

});

if(existingUser){

return res.status(400)
.json({
message:
"User already exists"
});

}

const hashedPassword =
await bcrypt.hash(
password,
10
);

const verificationToken =
crypto.randomBytes(32)
.toString("hex");

const user =
await prisma.user.create({

data:{

name,

email,

password:
hashedPassword,

verificationToken,

}

});

const token = jwt.sign(

{
userId:user.id
},

process.env.JWT_SECRET,

{
expiresIn:"7d"
}

);

res.status(201).json({

message:
"User created successfully",

token,

user:{
id:user.id,
name:user.name,
email:user.email,
verified:user.verified
}

});

}

catch(error){

console.log(error);

res.status(500).json({
message:"Server error"
});

}

};

const loginUser =
async(req,res)=>{

try{

const {
email,
password
} = req.body;

if(
!email ||
!password
){

return res.status(400)
.json({
message:
"All fields required"
});

}

const user =
await prisma.user.findUnique({

where:{email}

});

if(!user){

return res.status(400)
.json({
message:
"Invalid credentials"
});

}

const isMatch =
await bcrypt.compare(
password,
user.password
);

if(!isMatch){

return res.status(400)
.json({
message:
"Invalid credentials"
});

}

const token = jwt.sign(

{
userId:user.id
},

process.env.JWT_SECRET,

{
expiresIn:"7d"
}

);

res.status(200).json({

message:
"Login successful",

token,

user:{
id:user.id,
name:user.name,
email:user.email,
verified:user.verified
}

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

registerUser,

loginUser,

};