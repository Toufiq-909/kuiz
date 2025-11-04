import {Signin,Create} from "./components/Sign"
import {BrowserRouter,Route,Routes} from "react-router-dom";
import { Quiz } from "./components/Quizcreation";
import { Otp } from "./components/Otp";

export default function App()
{
  return (
    
   <BrowserRouter>
   <Routes>
    <Route path="/login" element={<Signin/>}/>
    <Route path="/create" element={<Create/>}/>
    <Route path="/quiz" element={<Quiz/>}/>
    <Route path="/otp" element={<Otp/>}/>
   </Routes>
   </BrowserRouter>
  )
}