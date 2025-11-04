import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {useState} from "react"
import { verify,Sendagain } from "../Apicall/create"
import {useNavigate} from "react-router-dom"
export function Otp(){
     let nav=useNavigate();
    let [Again,setAgain]=useState(false);
    let [otp,setotp]=useState("");
    let [msg,setmsg]=useState("");
    return (       
            <div className={"w-full h-[100vh]  flex flex-col-reverse md:flex-row justify-evenly items-center"}>
                <img src="\Enter OTP-pana.png" className={"w-[80%] md:w-[30%]"}/>
                 <Card className="w-full max-w-sm mr-0 md:mr-32">
      <CardHeader>
        <CardTitle className={"ml-4 mt-4"}>Enter your OTP</CardTitle>
        <CardDescription className={"ml-4 mt-4"}>
          We have sent your otp through Email
        </CardDescription>
        
      </CardHeader>
      <CardContent>
        <div className="mt-4">
             <InputOTP maxLength={6}  onChange={(value)=>{
                setotp(value)
                
             }}>
      <InputOTPGroup>
      <div className={"ml-4"}>
<InputOTPSlot index={0} />
      </div>
      <div className={"ml-4"}>
<InputOTPSlot index={1} />
      </div>
      <div className={"ml-4"}>
<InputOTPSlot index={2} />
      </div>
      <div className={"ml-4"}>
<InputOTPSlot index={3} />
      </div>
      <div className={"ml-4"}>
<InputOTPSlot index={4} />
      </div>
      <div className={"ml-4"}>
<InputOTPSlot index={5} />
      </div>
        
       
      </InputOTPGroup>
    </InputOTP>

        </div>
       
            
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button type="submit" className="w-full mt-4"
            onClick={async ()=>{
                let status=await verify(localStorage.getItem("email"),localStorage.getItem("pass"),otp);
                
                if(status==500)
                {
                    setmsg("Server Issue,please try again later!")

                }
                else if(status==401)
                {
                    setmsg("Invalid Otp")
                }
                else if(status==404)
                {
                    setmsg("User NOt found");
                    nav("/create",{
                        replace:true
                    })
                }
                else
                {
                    localStorage.clear();
                    nav("/select",{
                        replace:true
                    })

                }
                

            }}>
          Verify
        </Button>
        <Button variant="outline" className="w-full mt-4" disabled={Again} onClick={async()=>{
            setAgain(true);
            setTimeout(()=>{
                setAgain(false)
            },30000)
            let status=await Sendagain(localStorage.getItem("email"));
            if(status==500)
            {
                setmsg("Server Issue,please try again later!")

            }
            else if(status==404)
            {
                setmsg("User NOt found");
                    nav("/create",{
                        replace:true
                    })

            }
            else
            {
                setmsg("OTP has been sent successfully again")
            }
        }}>
          Send Again
        </Button>
         <Button variant="outline" className="w-full mt-4" onClick={async ()=>{
            localStorage.clear();
            nav("/create",{
                replace:true
            })


         }}>
            Change Mail
        </Button>
        <p className={"text-red-400"}>
            {msg}
        </p>
        
      </CardFooter>
    </Card>
            </div>
   
    )
}