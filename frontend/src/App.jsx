import {
Routes,
Route,
Navigate
}
from "react-router-dom";

import Dashboard
from "./pages/Dashboard";

import Login
from "./pages/Login";

import Register
from "./pages/Register";

import MyPosts
from "./pages/MyPosts";

import CreatePost
from "./pages/CreatePost";

import PendingPosts
from "./pages/PendingPosts";

import ScheduledPosts
from "./pages/ScheduledPosts";

import ProtectedRoute
from "./components/ProtectedRoute";

import BusinessProfile
from "./pages/BusinessProfile";

function App(){

return(

<Routes>

<Route
path="/"
element={
<Navigate
to="/login"
/>
}
/>

<Route
path="/login"
element={<Login/>}
/>

<Route
path="/register"
element={<Register/>}
/>

<Route
path="/dashboard"
element={
<ProtectedRoute>
<Dashboard/>
</ProtectedRoute>
}
/>

<Route
path="/my-posts"
element={
<ProtectedRoute>
<MyPosts/>
</ProtectedRoute>
}
/>

<Route
path="/create-post"
element={
<ProtectedRoute>
<CreatePost/>
</ProtectedRoute>
}
/>

<Route
path="/pending-posts"
element={
<ProtectedRoute>
<PendingPosts/>
</ProtectedRoute>
}
/>

<Route
path="/scheduled-posts"
element={
<ProtectedRoute>
<ScheduledPosts/>
</ProtectedRoute>
}
/>

<Route
path="/business-profile"
element={
<ProtectedRoute>
<BusinessProfile/>
</ProtectedRoute>
}
/>

</Routes>

);

}

export default App;