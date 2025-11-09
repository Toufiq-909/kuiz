use surrealdb::engine::any::Any;
use surrealdb::Surreal;
use std::sync::Arc;
use axum::extract::State;
use serde::{Deserialize,Serialize};
use axum::{Json,extract::Query};
use axum::response::IntoResponse;
use axum::http::StatusCode;
use lettre::message::header::ContentType;
use lettre::transport::smtp::authentication::Credentials;
use lettre::{Message, SmtpTransport, Transport};
 use lettre::message::Mailbox;
 use rand::Rng;

 use serde_json::{json,Value};
 use jsonwebtoken::Header;
  use jsonwebtoken::{EncodingKey,DecodingKey,Validation};
  use std::env;
  use dotenv::dotenv;
   use std::collections::HashMap;
#[derive(Deserialize,Serialize,Debug)]
pub struct User
{
   pub email:String
}
#[derive(Deserialize,Serialize,Debug)]
pub struct Existinguser
{
    pub email:String,
    pub password:String
}
#[derive(Deserialize,Serialize,Debug)]
pub struct Otp
{
    otp:String,
    email:String
}
#[derive(Deserialize,Serialize)]
pub struct VerifyUser
{
    email:String,
    otp:String,
    password:String,
   
}
#[derive(Deserialize)]
pub struct Validuser
{
    email:String,
    password:String,
    id:surrealdb::sql::Thing
}
#[derive(Serialize,Deserialize,Clone)]
pub struct Claims
{
    pub sub:String,
    pub exp:i32
}
pub async fn check(State(db):State<Arc<Surreal<Any>>>,Json(v):Json<User>)->impl IntoResponse
{
    let query=format!("select * from user where email ='{}'",v.email);
    let mut res=db.query(query).await.unwrap();
    let result:Option<User>=res.take(0).unwrap();
    match result
    { 
        Some(User)=>{
           return StatusCode::CONFLICT;

        }
        None=>{
           return StatusCode::OK;
        }
    }

}
#[axum::debug_handler]
pub async fn Otps(State(db):State<Arc<Surreal<Any>>>,Json(v):Json<User>)->impl IntoResponse
{
 
   let otp=rand::thread_rng().gen_range(100000..1000000);
   println!("{}",otp);
   let res:Option<Otp> =db.query(format!("upsert otp set otp='{}',email='{}' where email='{}'",otp,v.email.clone(),v.email.clone())).await.unwrap().take(0).unwrap();
   
   match Sendmail(otp.to_string(),v.email).await
   {
         Ok(_)=>StatusCode::OK,
         Err(e)=>{
            println!("{}",e);
            StatusCode::INTERNAL_SERVER_ERROR}
   }
}
#[axum::debug_handler]
pub async  fn Verify(State(db):State<Arc<Surreal<Any>>>,Json(v):Json<VerifyUser>)-> impl IntoResponse
{

    let mut res=db.query(format!("select * from otp where email='{}'",v.email)).await.unwrap();
    let user:Option<Otp>=res.take(0).unwrap();
    match user
    {
        Some(Otp)=>{
            if Otp.otp==v.otp
            {
                let mut res=db.query(format!("upsert user set email='{}',password=crypto::bcrypt::generate('{}') where email='{}'",v.email,v.password,v.email)).await.unwrap();
                let asdf:Option<Validuser>=res.take(0).unwrap();
                match asdf
                {
                    Some(Validuser)=>{
                        let token=Getjwt(Validuser.id.to_string());
                        if token=="Json creation failed"
                        {
                            (StatusCode::INTERNAL_SERVER_ERROR,"NO Token".to_string())
                        }
                        else
                        {
                          (StatusCode::OK,token)
                    } }
                    None=>{
                        println!("Error");
                        (StatusCode::INTERNAL_SERVER_ERROR,"NO Token".to_string())
                    }
                }
                
            }
            else
            {
               (StatusCode::UNAUTHORIZED,"not allowed".to_string())
            }
        }
        None=>{
            println!("otp has not created for that user");
            (StatusCode::NOT_FOUND,"not found".to_string())
        }
    }
   
  

}
pub async fn Updateotp(State(db):State<Arc<Surreal<Any>>>,Json(v):Json<User>)->impl IntoResponse
{
    let otp=rand::thread_rng().gen_range(100000..1000000);
    let mut res=db.query(format!("update otp set otp='{}' where email='{}'",otp,v.email)).await.unwrap();
    let result:Option<Otp>=res.take(0).unwrap();
    match result
    {
        Some(Otp)=>{
           match Sendmail(otp.to_string(),v.email).await
           {
              Ok(_)=>{
                StatusCode::OK
              }
              Err(e)=>{
                StatusCode::INTERNAL_SERVER_ERROR
              }
           }

        }
        None=>{
            StatusCode::NOT_FOUND
        }
    }
}
pub async fn Sendmail(otp:String,email:String)->Result<(),String>
{
     dotenv().ok();
    let email = Message::builder()
        .from(Mailbox::new(Some("FindVoltuneer".to_owned()), "findvolunteer@gmail.com".parse().unwrap()))
        .reply_to(Mailbox::new(Some("FindVoltuneer".to_owned()), "findvolunteer@gmail.com".parse().unwrap()))
        .to(Mailbox::new(Some("User".to_owned()), email.parse().unwrap()))
        .subject("Your OTP Code")
        .header(ContentType::TEXT_PLAIN)
        .body(String::from("Your OTP is ")+&otp.to_string())
        .unwrap();

    let creds = Credentials::new("findvolunteer@gmail.com".to_owned(), env::var("d").unwrap());

    // Open a remote connection to gmail
    let mailer = SmtpTransport::relay("smtp.gmail.com")
        .unwrap()
        .credentials(creds)
        .build();
   match mailer.send(&email) {
        Ok(_) => Ok(()),
        Err(e) =>Err(e.to_string()) ,
                }
}
pub  fn Getjwt(id:String)->String
{
    let claim=Claims{
        sub:id,
        exp:(chrono::Utc::now()+chrono::Duration::hours(1)).timestamp() as i32

    };
    let token= match jsonwebtoken::encode(&Header::default(),&claim,&EncodingKey::from_secret(env::var("jwtsecret").unwrap().as_ref()))
    {
        Ok(tok)=>tok,
        Err(e)=>"Json creation failed".to_string()
    };
    println!("{}",token);
    token


}
 pub async fn Signin(State(db):State<Arc<Surreal<Any>>>,Json(v):Json<Existinguser>)->impl IntoResponse
{
    let result:Option<Validuser>=db.query(format!("select * from user where email='{}'",v.email)).await.unwrap().take(0).unwrap();
    match result
    {
        Some(Validuser)=>{
        let res:Option<bool>=db.query(format!("crypto::bcrypt::compare('{}','{}')
            
                              ",Validuser.password,v.password)).await.unwrap().take(0).unwrap();;
            match res{
                Some(true)=>{

                    (StatusCode::OK,Getjwt(Validuser.id.to_string()))

                }
                 Some(false)=>{
            (StatusCode::UNAUTHORIZED,"Invalid credentials".to_string())
        }
        None=>{
            (StatusCode::INTERNAL_SERVER_ERROR,"Invalid".to_string())
        }
            }

            
        }
        None=>{
            (StatusCode::UNAUTHORIZED,"Invalid credentials".to_string())
        }
    }
}
pub async fn Verifyjwt(Query(v):Query<HashMap<String,String>>)->impl IntoResponse
{
    
    match jsonwebtoken::decode::<Claims>(&v.get("token").unwrap(),&DecodingKey::from_secret(env::var("jwtsecret").unwrap().as_ref()),&Validation::default())
    {
        Ok(_)=>{
            StatusCode::OK
        }
        Err(e)=>{
            println!("{}",e);
            StatusCode::UNAUTHORIZED
        }
    }

}
