import {Signin,Create} from "./components/Sign"
import {BrowserRouter,Route,Routes} from "react-router-dom";
import { Quiz } from "./components/Quizcreation";
import { Otp } from "./components/Otp";
import {Select} from "./components/Select"
import A from "./components/p"
import B from "./components/q"

export default function App()
{
  return (
    
   <BrowserRouter>
   <Routes>
    <Route path="/login" element={<Signin/>}/>
    <Route path="/create" element={<Create/>}/>
    <Route path="/quiz" element={<Quiz/>}/>
    <Route path="/otp" element={<Otp/>}/>
    <Route path="/select" element={<Select/>}/>
    <Route path="/participate" element={<A/>}/>
    <Route path="/analysis" element={<B/>}/>
   </Routes>
   </BrowserRouter>
  )
}