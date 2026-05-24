"use client";
import { useEffect, useState } from "react";


import API from "@/services/api";

function ScheduledPosts() {

const [posts,setPosts] =
useState<any[]>([]);

useEffect(()=>{

fetchScheduledPosts();

},[]);

const fetchScheduledPosts =
async()=>{

try{

const res =
await API.get(
"/posts/scheduled"
);

setPosts(
res.data.posts
);

}

catch(error){

console.log(error);

}

};

const cancelPost =
async(postId: number | string)=>{

try{

await API.put(
`/posts/update/${postId}`,
{
status:"ARCHIVED"
}
);

fetchScheduledPosts();

}

catch(error){

console.log(error);

}

};

return(

<div>

<div
className="
flex
justify-between
items-center
mb-10
"
>

<div>

<h1
className="
text-4xl
font-bold
text-white
"
>

Scheduled Posts

</h1>

<p
className="
text-white/60
mt-2
"
>

Manage your scheduled content

</p>

</div>

</div>

{
posts.length === 0 ? (

<div
className="
bg-white/5 border border-white/10 backdrop-blur-md
rounded-3xl
p-10
shadow-md
text-center
"
>

<h2
className="
text-2xl
font-semibold
text-white
mb-3
"
>

No Scheduled Posts

</h2>

<p className="text-white/60">

Your scheduled posts
will appear here.

</p>

</div>

) : (

<div className="space-y-6">

{
posts.map((post)=>(

<div
key={post.id}
className="
bg-white/5 border border-white/10 backdrop-blur-md
rounded-3xl
p-6
shadow-md
hover:shadow-xl
transition
"
>

<div
className="
flex
justify-between
items-start
"
>

<div className="w-3/4">

<h2
className="
text-2xl
font-semibold
text-white
"
>

{post.title}

</h2>

<p
className="
text-white/60
mt-3
leading-relaxed
"
>

{post.content}

</p>

<div
className="
flex
gap-6
mt-5
text-sm
text-white/40
"
>

<p>

Scheduled:
{" "}

{
new Date(
post.scheduledFor
).toLocaleString()
}

</p>

<p>

Created:
{" "}

{
new Date(
post.createdAt
).toLocaleString()
}

</p>

</div>

</div>

<div
className="
flex
flex-col
items-end
gap-4
"
>

<span
className="
px-5
py-2
rounded-full
bg-purple-100
text-purple-700
font-medium
"
>

{post.status}

</span>

<button
onClick={()=>
cancelPost(post.id)
}
className="
px-5
py-3
rounded-2xl
bg-red-100
text-red-700
hover:bg-red-200
"
>

Cancel

</button>

</div>

</div>

</div>

))
}

</div>

)
}

</div>

)

}

export default ScheduledPosts;