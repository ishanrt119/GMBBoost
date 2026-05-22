import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";

import API from "../services/api";

function PendingPosts() {

const [posts,setPosts] =
useState([]);

useEffect(()=>{

fetchPendingPosts();

},[]);

const fetchPendingPosts =
async()=>{

try{

const res =
await API.get(
"/posts/pending"
);

setPosts(
res.data.posts
);

}

catch(error){

console.log(error);

}

};

const approvePost =
async(postId)=>{

try{

await API.post(
`/posts/approve/${postId}`
);

fetchPendingPosts();

}

catch(error){

console.log(error);

}

};

const rejectPost =
async(postId)=>{

try{

await API.post(
`/posts/reject/${postId}`
);

fetchPendingPosts();

}

catch(error){

console.log(error);

}

};

return(

<div className="flex">

<Sidebar/>

<div
className="
ml-64
p-10
w-full
bg-slate-50
min-h-screen
"
>

<h1
className="
text-4xl
font-bold
mb-8
"
>

Pending Approval

</h1>

{
posts.length === 0 ? (

<div
className="
bg-white
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
mb-3
"
>

No Pending Posts

</h2>

<p className="text-gray-500">

Pending approval posts
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
bg-white
rounded-3xl
p-6
shadow-md
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
"
>

{post.title}

</h2>

<p
className="
text-gray-500
mt-3
"
>

{post.content}

</p>

</div>

<div
className="
flex
gap-3
"
>

<button
onClick={()=>
approvePost(post.id)
}
className="
px-5
py-3
rounded-2xl
bg-green-100
text-green-700
font-medium
hover:bg-green-200
"
>

Approve

</button>

<button
onClick={()=>
rejectPost(post.id)
}
className="
px-5
py-3
rounded-2xl
bg-red-100
text-red-700
font-medium
hover:bg-red-200
"
>

Reject

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

</div>

)

}

export default PendingPosts;