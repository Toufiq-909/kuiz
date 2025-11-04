use surrealdb::engine::any;
use surrealdb::opt::auth::Root;
use std::sync::Arc; 
use surrealdb::Surreal;
use surrealdb::engine::any::Any;
use std::env;
use dotenv::dotenv;

mod route;
mod handler; 
#[tokio::main]
async fn main()
{
    dotenv().ok();
    let db:Surreal<Any>=any::connect(env::var("db").unwrap()).await.unwrap();
    db.use_ns(env::var("ns").unwrap()).use_db(env::var("database").unwrap()).await.unwrap();
    
    db.signin(Root{
        username:&env::var("user").unwrap(),
        password:&env::var("password").unwrap()
    }).await.unwrap();
    let dbpool=Arc::new(db);

    let listener=tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener,route::app(dbpool.clone())).await.unwrap();
}