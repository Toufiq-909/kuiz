import {z} from "zod";
export async function  check(a,b)
{

    let validuser=z.object({
        a:z.email(),
        b:z.string().min(5).max(24)
    })
    let result=validuser.safeParse({
        a:a,
        b:b
    })
    if(result.success)
    {
          let res=await fetch("http://localhost:3000/check",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            email:a
        })
    }) 
         if(res.status==200)
         {
            let res1=await fetch("http://localhost:3000/otp",{
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({
                    email:a
                })
            })
            return res1.status;

         }
         return res.status;
    }
    else
    {
        if(result.error.issues[0].message==="Invalid email address")
        {
            return 401;
        }
        else
        {
            if(b.length<5)
            {
                return 400;
            }
            console.log("asdfasdf")
            return 402;
        }

    }
    //check passswowrd and mail

  
}
export async function verify(email,password,otp)
{
    let resp=await fetch("http://localhost:3000/verify",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
        email:email,
        password:password,
        otp:otp
        })
        

    })
    if(resp.status==200)
    {
         let res=await resp.text()
    console.log(res);
        localStorage.setItem("token",res);
    }
   
    
    return resp.status;
}
export async function Sendagain(email)
{
    let resp=await fetch("http://localhost:3000/updateotp",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            email:email
        })

    });
    return resp.status;
}
export async function login(email,password)
{
    let valid=z.object({
        email:z.email(),
        password:z.string().min(5).max(24)
    });
    let result=valid.safeParse({
        email:email,
        password:password
    })
    if(result.success)
    {

        let resp=await fetch("http://localhost:3000/signin",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            email:email,
            password:password
        })
    });
    if(resp.status==200)
    {
        let token=await resp.text();
        localStorage.setItem("token",token);

    }
    return resp.status;

    }
    else
    {
        return 401
    }
    
}