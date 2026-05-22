import {
createContext,
useEffect,
useState
}
from "react";

export const AuthContext =
createContext();

function AuthProvider({
children
}){

const [user,setUser] =
useState(null);

const [token,setToken] =
useState(
localStorage.getItem("token")
|| ""
);

useEffect(()=>{

const storedUser =
localStorage.getItem("user");

if(storedUser){

setUser(
JSON.parse(storedUser)
);

}

},[]);

const login = (
userData,
jwtToken
)=>{

setUser(userData);

setToken(jwtToken);

localStorage.setItem(
"token",
jwtToken
);

localStorage.setItem(
"user",
JSON.stringify(userData)
);

};

const logout = ()=>{

setUser(null);

setToken("");

localStorage.removeItem(
"token"
);

localStorage.removeItem(
"user"
);

};

return(

<AuthContext.Provider
value={{
user,
token,
login,
logout
}}
>

{children}

</AuthContext.Provider>

);

}

export default AuthProvider;