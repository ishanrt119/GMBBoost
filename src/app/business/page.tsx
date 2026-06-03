"use client";
import {
useEffect,
useState
}
from "react";

import { Sidebar } from "@/components/layout/Sidebar";

import API
from "@/services/api";

function BusinessProfile(){

const [formData,setFormData]
=
useState({

businessName:"",
businessType:"",
city:"",
services:"",
offers:"",
tone:"professional",
phone:"",
website:""

});

const [message,setMessage]
=
useState("");

useEffect(()=>{

fetchProfile();

},[]);

const fetchProfile =
async()=>{

try{

const res =
await API.get(
"/business/me"
);

if(res.data.profile){

setFormData({

businessName:
res.data.profile.businessName || "",

businessType:
res.data.profile.businessType || "",

city:
res.data.profile.city || "",

services:
res.data.profile.services || "",

offers:
res.data.profile.offers || "",

tone:
res.data.profile.tone || "professional",

phone:
res.data.profile.phone || "",

website:
res.data.profile.website || ""

});

}

}

catch(error){

console.log(error);

}

};

const handleChange =
(e: any)=>{

setFormData({

...formData,

[e.target.name]:
e.target.value

});

};

const handleSubmit =
async(e: React.FormEvent)=>{

e.preventDefault();

setMessage("");

if(
!formData.businessName ||
!formData.businessType ||
!formData.services
){

setMessage(
"Please fill all required fields"
);

return;

}

const phoneRegex =
/^[0-9]{10}$/;

if(
formData.phone &&
!phoneRegex.test(
formData.phone
)
){

setMessage(
"Phone number must be 10 digits"
);

return;

}

if(
formData.website &&
!formData.website.startsWith(
"http"
)
){

setMessage(
"Website must start with http or https"
);

return;

}

try{

await API.post(
"/business/save",
formData
);

setMessage(
"Business profile saved successfully"
);

}

catch(error){

console.log(error);

setMessage(
"Failed to save profile"
);

}

};

const handleDelete =
async()=>{

try{

await API.delete(
"/business/delete"
);

setFormData({

businessName:"",
businessType:"",
city:"",
services:"",
offers:"",
tone:"professional",
phone:"",
website:""

});

setMessage(
"Business profile deleted"
);

}

catch(error){

console.log(error);

setMessage(
"Failed to delete profile"
);

}

};

return(

<div className="flex">

<Sidebar/>

<div
className="
lg:ml-64
w-full
min-h-screen
bg-slate-50
p-10
"
>

<h1
className="
text-4xl
font-bold
mb-2
"
>

Business Profile

</h1>

<p
className="
text-gray-500
mb-10
"
>

Manage your business information for AI post generation

</p>

<div
className="
bg-white
rounded-3xl
shadow-lg
p-10
max-w-5xl
"
>

{
message && (

<div
className="
mb-6
bg-blue-100
text-blue-700
p-4
rounded-2xl
"
>

{message}

</div>

)
}

<form
onSubmit={handleSubmit}
className="
grid
grid-cols-2
gap-6
"
>

<input
type="text"
name="businessName"
placeholder="Business Name"
value={formData.businessName}
onChange={handleChange}
required
className="
p-4
rounded-2xl
border
outline-none
focus:ring-2
focus:ring-blue-400
"
/>

<input
type="text"
name="businessType"
placeholder="Business Type"
value={formData.businessType}
onChange={handleChange}
required
className="
p-4
rounded-2xl
border
outline-none
focus:ring-2
focus:ring-blue-400
"
/>

<input
type="text"
name="city"
placeholder="City"
value={formData.city}
onChange={handleChange}
className="
p-4
rounded-2xl
border
outline-none
focus:ring-2
focus:ring-blue-400
"
/>

<input
type="text"
name="phone"
placeholder="Phone Number"
value={formData.phone}
onChange={handleChange}
className="
p-4
rounded-2xl
border
outline-none
focus:ring-2
focus:ring-blue-400
"
/>

<input
type="text"
name="website"
placeholder="Website"
value={formData.website}
onChange={handleChange}
className="
p-4
rounded-2xl
border
outline-none
focus:ring-2
focus:ring-blue-400
"
/>

<select
name="tone"
value={formData.tone}
onChange={handleChange}
className="
p-4
rounded-2xl
border
outline-none
focus:ring-2
focus:ring-blue-400
"
>

<option value="professional">
Professional
</option>

<option value="friendly">
Friendly
</option>

<option value="luxury">
Luxury
</option>

<option value="casual">
Casual
</option>

</select>

<textarea
name="services"
placeholder="Services"
value={formData.services}
onChange={handleChange}
rows={5}
className="
col-span-2
p-4
rounded-2xl
border
outline-none
focus:ring-2
focus:ring-blue-400
"
/>

<textarea
name="offers"
placeholder="Special Offers"
value={formData.offers}
onChange={handleChange}
rows={4}
className="
col-span-2
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
col-span-2
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

Save Business Profile

</button>
<button
type="button"
onClick={handleDelete}
className="
col-span-2
bg-red-500
text-white
p-4
rounded-2xl
font-semibold
hover:bg-red-600
transition
"
>

Delete Business Profile

</button>

</form>
<div
className="
mt-10
bg-slate-100
p-8
rounded-3xl
"
>

<h2
className="
text-2xl
font-bold
mb-6
"
>

Business Preview

</h2>

<div className="space-y-3">

<p>
<span className="font-semibold">
Business:
</span>
{" "}
{formData.businessName}
</p>

<p>
<span className="font-semibold">
Type:
</span>
{" "}
{formData.businessType}
</p>

<p>
<span className="font-semibold">
City:
</span>
{" "}
{formData.city}
</p>

<p>
<span className="font-semibold">
Tone:
</span>
{" "}
{formData.tone}
</p>

<p>
<span className="font-semibold">
Services:
</span>
{" "}
{formData.services}
</p>

<p>
<span className="font-semibold">
Offers:
</span>
{" "}
{formData.offers}
</p>

</div>

</div>


</div>

</div>

</div>

);

}

export default BusinessProfile;