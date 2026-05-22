import {
useState,
useContext
}
from "react";

import {
useNavigate,
Link
}
from "react-router-dom";

import API from "../services/api";

import {
AuthContext
}
from "../context/AuthContext";

function Register(){

const navigate =
useNavigate();

const { login } =
useContext(AuthContext);

const [formData,setFormData]
= useState({

name:"",
email:"",
password:""

});

const [error,setError]
= useState("");

const handleChange =
(e)=>{

setFormData({

...formData,

[e.target.name]:
e.target.value

});

};

const handleSubmit =
async(e)=>{

e.preventDefault();

setError("");

try{

const res =
await API.post(
"/auth/register",
formData
);

login(
res.data.user,
res.data.token
);

navigate("/dashboard");

}

catch(error){

setError(
error.response?.data?.message
||
"Registration failed"
);

}

};

return(

<div
className="
min-h-screen
flex
items-center
justify-center
bg-gradient-to-br
from-blue-100
to-purple-100
"
>

<div
className="
bg-white
p-10
rounded-3xl
shadow-xl
w-full
max-w-md
"
>

<h1
className="
text-4xl
font-bold
mb-2
text-center
"
>

Create Account

</h1>

<p
className="
text-gray-500
text-center
mb-8
"
>

AI Content Scheduler

</p>

{
error && (

<p
className="
bg-red-100
text-red-600
p-3
rounded-xl
mb-5
"
>

{error}

</p>

)
}

<form
onSubmit={handleSubmit}
className="space-y-5"
>

<input
type="text"
name="name"
placeholder="Full Name"
value={formData.name}
onChange={handleChange}
required
className="
w-full
p-4
rounded-2xl
border
outline-none
focus:ring-2
focus:ring-blue-400
"
/>

<input
type="email"
name="email"
placeholder="Email"
value={formData.email}
onChange={handleChange}
required
className="
w-full
p-4
rounded-2xl
border
outline-none
focus:ring-2
focus:ring-blue-400
"
/>

<input
type="password"
name="password"
placeholder="Password"
value={formData.password}
onChange={handleChange}
required
className="
w-full
p-4
rounded-2xl
border
outline-none
focus:ring-2
focus:ring-blue-400
"
/>

<button
type="submit"
className="
w-full
bg-gradient-to-r
from-blue-600
to-purple-600
text-white
p-4
rounded-2xl
font-semibold
hover:opacity-90
transition
"
>

Register

</button>

</form>

<p
className="
text-center
mt-6
text-gray-500
"
>

Already have account?

<Link
to="/login"
className="
text-blue-600
font-semibold
ml-2
"
>

Login

</Link>

</p>

</div>

</div>

);

}

export default Register;