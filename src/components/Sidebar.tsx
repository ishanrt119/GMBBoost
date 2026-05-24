"use client";
import {
Link,
useRouter
}
from "next/navigation";

import {
useContext
}
from "react";

import {
AuthContext
}
from "../context/AuthContext";

function Sidebar(){

const navigate =
useRouter();

const {
user,
logout
}
=
useContext(AuthContext);

const handleLogout =
()=>{

logout();

router.push("/login");

};

return(

<div
className="
fixed
left-0
top-0
w-64
h-screen
bg-gradient-to-b
from-blue-700
to-purple-700
text-white
p-6
shadow-2xl
"
>

<h1
className="
text-3xl
font-bold
mb-10
"
>

AI Scheduler

</h1>

<div
className="
bg-white/10
p-4
rounded-2xl
mb-10
"
>

<p
className="
text-sm
text-blue-100
"
>

Logged in as

</p>

<h2
className="
text-xl
font-semibold
mt-1
"
>

{user?.name || "User"}

</h2>

<p
className="
text-sm
text-blue-100
mt-1
break-all
"
>

{user?.email}

</p>

</div>

<nav
className="
flex
flex-col
gap-4
"
>

<Link
to="/dashboard"
className="
hover:bg-white/10
p-3
rounded-xl
transition
"
>

Dashboard

</Link>

<Link
to="/create-post"
className="
hover:bg-white/10
p-3
rounded-xl
transition
"
>

Create Post

</Link>

<Link
to="/my-posts"
className="
hover:bg-white/10
p-3
rounded-xl
transition
"
>

My Posts

</Link>

<Link
to="/pending-posts"
className="
hover:bg-white/10
p-3
rounded-xl
transition
"
>

Pending Posts

</Link>

<Link
to="/scheduled-posts"
className="
hover:bg-white/10
p-3
rounded-xl
transition
"
>

Scheduled Posts

</Link>

<Link
to="/business-profile"
className="
hover:bg-white/10
p-3
rounded-xl
transition
"
>

Business Profile

</Link>

<button
onClick={handleLogout}
className="
mt-10
bg-white
text-purple-700
font-semibold
p-3
rounded-2xl
hover:scale-105
transition
"
>

Logout

</button>

</nav>

</div>

);

}

export default Sidebar;