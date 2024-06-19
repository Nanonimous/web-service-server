import  express  from "express";
import body from "body-parser";
import {dirname} from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import multer from "multer";
import bcrypt from "bcryptjs";
import passport from "passport";
import { Strategy } from "passport-local";
import session from "express-session";
import pg from "pg";
import nodemailer from "nodemailer";
import {query} from "express-validator";
import { error } from "console";

 
const server = express(); 
const port = 4000;
const saltRounds  =10;
const dir = dirname(fileURLToPath(import.meta.url));
const upload = multer({});
const domain = "http://localhost:3000/";
const our_domain="http://localhost:4000/"

var dept =""; 
var sub="";
let datas = []
let otp;

server.use(express.static("public"));
server.use(body.urlencoded({extended:true,limit:'100mb'}));
server.use(body.json({limit:'100mb'}));
server.use(
    session({
      secret: "ilovethaiyal",
      resave: false,
      saveUninitialized: true,
    })
  );

server.use(passport.initialize());
server.use(passport.session());

//otp sending part bro
let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",  // SMTP server host
  port: 587,                 // SMTP port (587 for TLS)
  secure: false,             // true for 465 (SSL), false for other ports
  auth: {
      user: 'zenotionsolutions@gmail.com',
      pass:  'hlem wpqf vpdt gntv'
  }
});
server.use((req, res, next) => {
  // Store current URL as previous URL in session
  if (req.session) {
      req.session.previousUrl = req.session.currentUrl || '';
      req.session.currentUrl = req.originalUrl;
  }
  next();
});

//send the response as lanch page 
server.get("/",(req,res)=>{
    res.sendFile(dir + "/public/html_files/lanch_page/lanch_page.html");
});
 
//send the log in page to client

server.get("/log_in",
  (req,res)=>{
    if(req.isAuthenticated()){
      req.logout(function (err) {
        if (err) {
          return next(err);
        }
        res.redirect("/log_in")
      });
    }else{
      res.render("log_in_page/login.ejs");
    }
})
 
//for authentication and login 
server.post("/login", 
    passport.authenticate("local", {
    successRedirect: "/IOT",
    failureRedirect: "/log_in",
  }));
 
  server.post("/email_check", async(req, res) => {
    try {
        const checkResult = await axios.post(`${domain}email`);
        let entered_email = req.body.email;
        let found = false;

        for (let element of checkResult.data) {
            if (element.email === entered_email) {
                found = true;
                res.json({ available: false, message: 'email already exists!' });
                break; // Ensure no further processing after response
            }
        }
        if (!found) {
            res.json({ available: true, message: 'email is available.' });
        }
    } catch (error) {
        console.error('Error in email check:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

server.post("/user_check", async(req,res)=>{
    const checkResult = await axios.post(`${domain}login/auth`,{
      "username": req.body.username
    });
    if ((checkResult.data).length > 0) {
      res.json({ available: false, message: 'Username already exists!' });
    }
    else{
      res.json({ available: true, message: 'Username is available.' });
    }
});

//for registation and hasing the password 
server.post("/opt_verify",async(req,res)=>{
  datas[0]=req.body.username;
  try {
    const checkResult = await axios.post(`${domain}login/auth`,{
      "username": datas[0]
    });
  otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP  h
  transporter.sendMail({
    from: '"Zenotion" <zenotionsolutions@gmail.com>', // sender address
    to: `${req.body.email}`,
    subject: `Your Code: ${otp}`,                  // list of receivers
    html: `
    <!DOCTYPE html>
<html lang="en"> 
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Executive Communication</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #17171A;
        }
        .email-wrapper {
            max-width: 600px;
            margin: auto;
            background-color: #0F0F11;

            padding: 20px;
            border: 1px solid #6941F5;
        }
        .header {
          background-image: linear-gradient(144deg,#AF40FF, #5B42F3 50%,#00DDEB);
            color: #ffffff;
            padding: 3px;

            text-align: center;
            font-size: 24px;
        }
        .header span{
          background-image: linear-gradient(111deg, #f85d7f, #6b81fa);
        background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .grad_over{
          padding: 20px;
          background-color: rgb(5, 6, 45);
          border-radius: 4px;
          transition: 300ms;
        }
        .content {
            padding: 20px;
            font-size: 16px;
            line-height: 1.6;
            color: #333333;
            
        }
        .content p {
            margin-bottom: 1em;
            color: white;
        }
        .footer {
            text-align: center;
            padding: 20px;
            font-size: 14px;
            background-color: rgb(32, 32, 36);
            color: #666;
        }
        .otp_display{
          color: white;
        }
        .otp_display span{
          background-image: linear-gradient(111deg, #f85d7f, #6b81fa);
        background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .footer a {
            color: white;
            text-decoration: none;
        }
        .otp_container{
          background-color: #17171A;
          display: flex;
          justify-content: center;
          align-items: center;
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="header">
          <div class="grad_over">
            <span> OTP VERIFICATION</span>
          </div>
        </div>
        <div class="content">
            <p>Dear ${datas[0]},</p>
            <p>Warm regards,</p>
            <p>The otp you received is for email verification while registering your account</p>
            <p>Here is your OTP :</p>
            <div class="otp_container">

              <h1 class="otp_display"><span>${otp}</span></h1>
            </div>
        
            <p>Admin<br>EmailBot<br>zenotionsolutions@gmail.com</p>
        </div>
        <div class="footer">
            <p>Connect with us:</p>
            <a href="https://www.linkedin.com">LinkedIn</a> | <a href="https://www.twitter.com">Twitter</a>
            <p>&copy; 2024 india All rights reserved.</p>
        </div>
    </div>
</body> 
</html>`
    }, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
    });
  
  let pass_before_hash = req.body.password;
  console.log(pass_before_hash)
  bcrypt.hash(pass_before_hash, saltRounds, async (err, hash) => { 
    if (err) {
      console.error("Error hashing password:");
    } else {
      datas[1] = hash;
    }});
  datas[2]=req.body.email;
  console.log(`working till now `);
  console.log(req.session.previousUrl); 
  res.render("./log_in_page/otp.ejs"); 
   
}catch(err){
  console.log("notworking") 
}});
 

server.post("/otp_auth",async(req,res)=>{
  var no1 = req.body.no1;
  var no2 = req.body.no2;
  var no3 = req.body.no3;
  var no4 = req.body.no4;
  var no5 = req.body.no5;
  var no6 = req.body.no6;
  var otpList = [no1,no2,no3,no4,no5,no6]
  const output = otpList.join('');
  console.log(output)
  if(output==otp){
    console.log("came near registation route");
    res.redirect("/register");
  }else{
    console.log("otp worng");
    otp = Math.floor(100000 + Math.random() * 900000); 
    transporter.sendMail({
      from: '"Zenotion" <zenotionsolutions@gmail.com>', // sender address
      to: `${datas[2]}`,
      subject: `Your Code: ${otp}`,                  // list of receivers
      html: `
      <!DOCTYPE html>
<html lang="en"> 
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Executive Communication</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #17171A;
        }
        .email-wrapper {
            max-width: 600px;
            margin: auto;
            background-color: #0F0F11;

            padding: 20px;
            border: 1px solid #6941F5;
        }
        .header {
          background-image: linear-gradient(144deg,#AF40FF, #5B42F3 50%,#00DDEB);
            color: #ffffff;
            padding: 3px;

            text-align: center;
            font-size: 24px;
        }
        .header span{
          background-image: linear-gradient(111deg, #f85d7f, #6b81fa);
        background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .grad_over{
          padding: 20px;
          background-color: rgb(5, 6, 45);
          border-radius: 4px;
          transition: 300ms;
        }
        .content {
            padding: 20px;
            font-size: 16px;
            line-height: 1.6;
            color: #333333;
            
        }
        .content p {
            margin-bottom: 1em;
            color: white;
        }
        .footer {
            text-align: center;
            padding: 20px;
            font-size: 14px;
            background-color: rgb(32, 32, 36);
            color: #666;
        }
        .otp_display{
          color: white;
        }
        .otp_display span{
          background-image: linear-gradient(111deg, #f85d7f, #6b81fa);
        background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .footer a {
            color: white;
            text-decoration: none;
        }
        .otp_container{
          background-color: #17171A;
          display: flex;
          justify-content: center;
          align-items: center;
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="header">
          <div class="grad_over">
            <span> OTP VERIFICATION</span>
          </div>
        </div>
        <div class="content">
            <p>Dear ${datas[0]},</p>
            <p>Warm regards,</p>
            <p>The otp you received is for email verification while registering your account</p>
            <p>Here is your OTP :</p>
            <div class="otp_container">

              <h1 class="otp_display"><span>${otp}</span></h1>
            </div>
        
            <p>Admin<br>EmailBot<br>zenotionsolutions@gmail.com</p>
        </div>
        <div class="footer">
            <p>Connect with us:</p>
            <a href="https://www.linkedin.com">LinkedIn</a> | <a href="https://www.twitter.com">Twitter</a>
            <p>&copy; 2024 india All rights reserved.</p>
        </div>
    </div>
</body>
</html>`
      }, (error, info) => {
          if (error) {
              return console.log(error);
          }
          console.log('Message sent: %s', info.messageId);
      });// 6-digit OTP  h
    res.render("./log_in_page/otp.ejs",{alert:"new otp send"});
  }
});

//registation
server.get("/register",async(req,res)=>{
  try{
    console.log("came here");
    let new_username = datas[0];
    let new_password = datas[1]; 
    console.log(new_password); 
    let new_email = datas[2];
    const result =  await axios.post(`${domain}register/auth`,{
    "username":new_username,
    "password":new_password,
    "email":new_email
  });
      const user = result.data[0]; 
      req.login(user, (err) => {
        console.log("success");
        res.redirect("/IOT"); 
      });
  }catch(err){
    console.log(err);
  }

});

//resetting password email
server.post("/reset_otp",(req,res)=>{
  otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
  datas[2]=req.body.email;
  transporter.sendMail({
    from: '"Zenotion" <dreamdj0071@gmail.com>', // sender address
    to: `${datas[2]}`,                  // list of receivers 
    subject: `Your Code: ${otp}`,                          // Subject line
    text: `Your OTP is for resetting: ${otp}`,                  // plain text body
    html: `<!DOCTYPE html>
    <html lang="en"> 
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Executive Communication</title>
        <style>
            body {
                font-family: 'Arial', sans-serif;
                margin: 0;
                padding: 0;
                background-color: #17171A;
            }
            .email-wrapper {
                max-width: 600px;
                margin: auto;
                background-color: #0F0F11;
    
                padding: 20px;
                border: 1px solid #6941F5;
            }
            .header {
              background-image: linear-gradient(144deg,#AF40FF, #5B42F3 50%,#00DDEB);
                color: #ffffff;
                padding: 3px;
    
                text-align: center;
                font-size: 24px;
            }
            .header span{
              background-image: linear-gradient(111deg, #f85d7f, #6b81fa);
            background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            .grad_over{
              padding: 20px;
              background-color: rgb(5, 6, 45);
              border-radius: 4px;
              transition: 300ms;
            }
            .content {
                padding: 20px;
                font-size: 16px;
                line-height: 1.6;
                color: #333333;
                
            }
            .content p {
                margin-bottom: 1em;
                color: white;
            }
            .footer {
                text-align: center;
                padding: 20px;
                font-size: 14px;
                background-color: rgb(32, 32, 36);
                color: #666;
            }
            .otp_display{
              color: white;
            }
            .otp_display span{
              background-image: linear-gradient(111deg, #f85d7f, #6b81fa);
            background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            .footer a {
                color: white;
                text-decoration: none;
            }
            .otp_container{
              background-color: #17171A;
              display: flex;
              justify-content: center;
              align-items: center;
            }
        </style>
    </head>
    <body>
        <div class="email-wrapper">
            <div class="header">
              <div class="grad_over">
                <span> OTP VERIFICATION</span>
              </div>
            </div>
            <div class="content">
                <p>Dear ${datas[0]},</p>
                <p>Warm regards,</p>
                <p>The otp is sent for password reset:</p>
                <p>Here is your OTP :</p>
                <div class="otp_container">
    
                  <h1 class="otp_display"><span>${otp}</span></h1>
                </div>
            
                <p>Admin<br>EmailBot<br>zenotionsolutions@gmail.com</p>
            </div>
            <div class="footer">
                <p>Connect with us:</p>
                <a href="https://www.linkedin.com">LinkedIn</a> | <a href="https://www.twitter.com">Twitter</a>
                <p>&copy; 2024 india All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>`            // HTML body content
    }, (error, info) => {
        if (error) {  
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
    });
  res.render("./log_in_page/forget_otp.ejs");
});

 
server.get("/forget_pass",(req,res)=>{
  res.render("./log_in_page/forget_pass.ejs");
});

server.post("/reset_pass",async(req,res)=>{
  var no1 = req.body.no1;
  var no2 = req.body.no2;
  var no3 = req.body.no3;
  var no4 = req.body.no4;
  var no5 = req.body.no5;
  var no6 = req.body.no6;
  var otpList = [no1,no2,no3,no4,no5,no6]
  const output = otpList.join('');
  console.log(output);
  if(output==otp){
    res.render("./log_in_page/pass_reset.ejs");
  }
});  

server.post("/update_pass", async(req,res)=>{
  var updated_pass = req.body.password;
  console.log(updated_pass);
  bcrypt.hash(updated_pass, saltRounds, async (err, hash) => { 
    if (err) {
      console.error("Error hashing password:");
    } else {
      await axios.post(`${domain}changePass`,{
        "new_password":hash,
        "email":datas[2]
      });   
    }});
    res.redirect("/log_in");
   
}); 

server.get('/favicon.ico', (req, res) => res.status(204));

//selecting the depertment and subject
server.get("/:dept",async(req,res)=>{
  if(req.isAuthenticated()){

    try{
      let dept = ["IOT","FT","IT","MECH","EEE","ROBOTICS","CSE","ECE","AIML"];
  
      let select = req.params.dept;
      let check_topic = dept.includes(select);
      console.log(check_topic);  
      select = select.toLowerCase();
  
  if(check_topic){
      const dept_sem_collection = await axios.get(`${domain}${select}`);
      const data = dept_sem_collection.data;
      console.log(data);
      
      res.render("dept_selecting_page/rechange.ejs",{"dept":dept,"sem_sub":data,"select":select.toUpperCase()});
  }else{
      res.send("page not found");
  }
  }catch(err){
      res.send('page not found');
  }
    }else{
    res.redirect("/log_in");
  }
});


// get into subject page to select the unit

server.get("/:dept/:sub/:unit",async(req,res)=>{

  try{
    dept = req.params.dept;
    sub = req.params.sub;
    const unit = parseInt(req.params.unit);

    let check = req.user.role;

    const dept_sem_collection = await axios.get(`${domain}${dept}`);
    const subjects = dept_sem_collection.data;

    let user_data_username = req.user.username;
    let user_data_role = req.user.role;
    console.log(req.user);
    
    let result = subject_join(subjects,sub);
    
if(result && unit>=1 && unit <=5 ){
    const topics = await axios.get(`${domain}${dept}/${sub}/${unit}`);
    const topic_arr = topics.data;

if(check === "teacher" ){

    res.render("subject_page/subject_page.ejs",{"sub":sub,"dept":dept,"unit":unit,"topics":topic_arr,domain:domain});

}else{
  if(check === "stud"){
    res.render("without_plus_student/subject_page.ejs",{"sub":sub,"dept":dept,"unit":unit,"topics":topic_arr,domain:domain});
    
}}}else
    res.send("page not found");

}catch(err){
     res.send(err);
 }
});
// add a new topic to the database
server.post("/:dept/:sub/:unit/new_topic",async(req,res)=>{

  try{
    sub = req.params.sub;
    const unit = parseInt(req.params.unit);
    const data = req.body.topic;

    const dept_sem_collection = await axios.get(`${domain}${dept}`);
    const subjects = dept_sem_collection.data;
    let result = subject_join(subjects,sub);
    
    if(result && unit>=1 && unit <=5 ){
    const add_topic=await axios.post(`${domain}${dept}/${sub}/${unit}`,{
        topic:data
    },
    res.redirect((`/${dept}/${sub}/${unit}`))
)}else{
    res.send("page not found");
}
}catch(err){
    res.send(err);
}
})



//resource page connecting

// get for document resource

server.get("/:dept/:sub/:unit/:topic/doc_res",async(req,res)=>{
    try{
    const dept =req.params.dept;
     sub=req.params.sub;
    const unit =req.params.unit;
    const topic = req.params.topic;

    let check = req.user.role;

    const respond = await axios.post(`${domain}topic/doc_get`,{
        "dept":dept,
        "sub":sub,
        "unit":unit,
        "topic":topic,
        });
        console.log(respond.data);
        const data=respond.data;

    if(check === "teacher" ){
res.render("source_document/resource_document.ejs",{"sub":sub,"dept":dept,"unit":unit,"topic":topic,"data":data});
    }else{
      if(check === "stud"){
res.render("source_document/resource_document_without_plus.ejs",{"sub":sub,"dept":dept,"unit":unit,"topic":topic,"data":data})
    }}
}catch(err){
    res.send(err);
}
})

// get request for link resource

server.get("/:dept/:sub/:unit/:topic/link_res",async(req,res)=>{
  try{
    const dept =req.params.dept;
    sub=req.params.sub;
    const unit =req.params.unit;
    const topic = req.params.topic;

    let check = req.user.role;

    const respond = await axios.post(`${domain}topic/link_get`,{
    "dept":dept,
    "sub":sub,
    "unit":unit,
    "topic":topic,
    });

    const data=respond.data;
    if(check === "teacher" ){
    res.render("source_link/resource_link.ejs",{"sub":sub,"dept":dept,"unit":unit,"topic":topic,"data":data});
    }else{if(check === "stud"){
        res.render("source_link/resource_link_without_plus.ejs",{"sub":sub,"dept":dept,"unit":unit,"topic":topic,"data":data})
    } }
    }catch(err){
        res.send(err)
    }
})


// get request for video resource

server.get("/:dept/:sub/:unit/:topic/video_res",async(req,res)=>{
  try{
    const dept =req.params.dept;
    sub=req.params.sub;
    const unit =req.params.unit;
    const topic = req.params.topic;

    let check = req.user.role;

    const respond = await axios.post(`${domain}topic/video_get`,{
        "dept":dept,
        "sub":sub,
        "unit":unit,
        "topic":topic,
        });
        const data = respond.data;
        if(check === "teacher" ){
    res.render("sorce_video/resource.ejs",{"sub":sub,"dept":dept,"unit":unit,"topic":topic,"data":data});
        }else{if(check === "stud"){
        res.render("sorce_video/resource_without_plus.ejs",{"sub":sub,"dept":dept,"unit":unit,"topic":topic,"data":data})
        }}
    }catch(err){
        res.send(err)
    }
})

 
// post request for link resource to add

server.post("/:dept/:sub/:unit/:topic/link_res",async(req,res,next)=>{
  try{
    const dept =req.params.dept;
    sub=req.params.sub;
    const unit =req.params.unit;
    const topic = req.params.topic;
    console.log(req.body);
    const respond = await axios.post(`${domain}topic/link`,{
    "dept":dept,
    "sub":sub,
    "unit":unit,
    "topic":topic,
    "body":req.body
    })
   res.redirect((`${our_domain}${dept}/${sub}/${unit}/${topic}/link_res`));
}catch(err){
    res.send(err);
}
  })


//post request for video resource to add

server.post("/:dept/:sub/:unit/:topic/video_res",async(req,res,next)=>{
  try{
    const dept =req.params.dept;
    sub=req.params.sub;
    const unit =req.params.unit;
    const topic = req.params.topic;
    console.log(req.body);
    const respond = await axios.post(`${domain}topic/video`,{
    "dept":dept,
    "sub":sub,
    "unit":unit,
    "topic":topic,
    "body":req.body
    })
    res.redirect((`${our_domain}${dept}/${sub}/${unit}/${topic}/video_res`));
}catch(err){
    res.send(err)
}
})

//post request for document resource to add

server.post("/:dept/:sub/:unit/:topic/doc_res",upload.single('file'),async(req,res)=>{
  try{
    const dept =req.params.dept;
     sub=req.params.sub;
    const unit =req.params.unit;
    const topic = req.params.topic;
    const fileType = getFileType(req.file.originalname);
    let iconClass = "";

    switch (fileType) {
      case "PDF Document":
        iconClass = "fa-solid fa-file-pdf";        
        break;
      case "JPG Image":
      case "PNG Image":
        iconClass = "ri-image-2-fill"; 
        break;
      case "Microsoft Word Document x":
      case "Microsoft Word Document":
        iconClass = "fa-solid fa-file-word";
        break;
      case "Microsoft PowerPoint Presentation":
      case "Microsoft PowerPoint Presentation x":
        iconClass = "fa-light fa-file-ppt";
        break;
      case "MP4 Video":
        iconClass = "ri-video-fill";
        break;
      default:
        iconClass = "fa-solid fa-file-pdf"; 
    }
    console.log(req.body);
    console.log(req.file);
    const respond = await axios.post(`${domain}upload_pdf`,{
        "dept":dept,
        "sub":sub,
        "unit":unit,
        "topic":topic,
        "buffer_base64":Buffer.from(req.file.buffer).toString('base64'),
        "file":req.file.originalname,
        "doc_title":req.body.topic,
        "description":req.body.description,
        "iconClass": iconClass
    })


res.redirect((`${our_domain}${dept}/${sub}/${unit}/${topic}/doc_res`));
    }catch(err){
        res.send(err)
    }
})



server.get("/:dept/:sub/:unit/:topic/doc_res/show_doc",async(req,res)=>{

  try{ const dept =req.params.dept;
   sub=req.params.sub;
   const unit =req.params.unit;
   const topic = req.params.topic;

   const respond = await axios.post(`${domain}show_pdf`,{
       "dept":dept,
       "sub":sub,
       "unit":unit,
       "topic":topic,
       "file_n":req.query
   });

console.log(req.query['file_name']);
   const data = respond.data.document;
   const fileType = getFileType(req.query['file_name']);

   switch (fileType) {
      case "PDF Document":
        res.send(`<embed src="data:application/pdf;base64,${data}" type="application/pdf" " style="background-color:black;height:100vh;width:100%">`);
        break;
      case "JPG Image":
        res.send(`<img src="data:image/jpeg;base64,${data}" alt="JPG Image" style="background-color:black;height:100vh;width:100%">`);
        break;
      case "PNG Image":
        res.send(`<img src="data:image/png;base64,${data}" alt="PNG Image">`);
        break;
      case "Microsoft PowerPoint Presentation x":
        const pptxBuffer = Buffer.from(data, 'base64');
        res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
        res.set('Content-Disposition', `attachment; filename="${req.query['file_name']}"`);
        res.send(pptxBuffer);
        break;
      case "Microsoft Word Document x":
        const docxBuffer = Buffer.from(data, 'base64');
        res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.set('Content-Disposition', `attachment; filename="${req.query['file_name']}"`);
        res.send(docxBuffer);
        break;
      case "Microsoft Word Document":
        const docBuffer = Buffer.from(data, 'base64');
        res.set('Content-Type', 'application/msword');
        res.set('Content-Disposition', `attachment; filename="${req.query['file_name']}"`);
        res.send(docBuffer);
        break;
      case "Microsoft PowerPoint Presentation":
        const pptBuffer = Buffer.from(data, 'base64');
        res.set('Content-Type', 'application/vnd.ms-powerpoint');
        res.set('Content-Disposition', `attachment; filename="${req.query['file_name']}"`);
        res.send(pptBuffer);
        break;  
        case "MP4 Video":
          const mp4Buffer = Buffer.from(data, 'base64');
          res.set('Content-Type', 'video/mp4');
          res.send(mp4Buffer);
          break;
      default:
        res.status(400).send('Unsupported file type');
    }
}catch(err){
   console.log(`this is ${err}`);

}
})
//add new topic to student database

server.post("/:dept/:sub/stu/new_topics",async(req,res)=>{
  try{

  const {dept,sub} = req.params;
  const new_topic = req.body.topic; 
console.log(dept,sub,new_topic);
const respond = await axios.post(`${domain}stu_add_topic`,{
  "dept":dept,
  "sub":sub,
  "topic":new_topic,
  "user_name":req.user.username
},res.redirect(`${our_domain}${dept}/${sub}/student/own_work`))
  }catch(err){
    res.send(err)
  }
})



//student own work page director

server.get("/:dept/:sub/student/own_work",async(req,res)=>{
  try{
  dept =req.params.dept;
  sub=req.params.sub;

  const user_name = req.user.username;
 
  console.log(user_name);

const topic= await axios.post(`${domain}show_stu_topic`,{
  "dept":dept,
  "sub":sub,
  "user_name":user_name,
})

const arr = topic.data;
console.log(arr)
res.render("with_plus_for_student/subject_page.ejs",{dept:dept,"topics":arr,sub:sub,domain:our_domain});
  }catch(err){
    res.send(err)
  }

})

//student own work document take

server.get("/:dept/:sub/student/own_work/:topic/doc_res",async(req,res)=>{
   
  const dept =req.params.dept;
  const sub=req.params.sub;
  const topic =req.params.topic;
  const user_name = req.user.username;

  const respond = await axios.post(`${domain}stu_doc_name`,{
    "dept":dept,
    "sub":sub,
    "topic":topic,
    "user_name":user_name
  })
  const data =respond.data
 
res.render("source_document/resource_document_for_student.ejs",{
  "dept":dept, 
  "sub":sub,
  "topic":topic,
  "data":data
})
})

//student own work link take 

server.get("/:dept/:sub/student/own_work/:topic/link_res",async(req,res)=>{
  const dept =req.params.dept;
  const sub=req.params.sub;
  const user_name = req.user.username;
  const topic = req.params.topic;
  
  const respond = await axios.post(`${domain}stu_shows_link`,{
    "dept":dept,
    "sub":sub,
    "topic":topic,
    "user_name":user_name
  })

  const data =respond.data
res.render("source_link/resource_link_for_student.ejs",{
  "dept":dept, 
  "sub":sub,
  "topic":topic,
  "data":data
})
}) 

//student own work video take

server.get("/:dept/:sub/student/own_work/:topic/video_res",async(req,res)=>{
  const dept =req.params.dept;
  const sub=req.params.sub;
  const user_name = req.user.username;
  const topic = req.params.topic;

  const respond = await axios.post(`${domain}stu_shows_video`,{
    "dept":dept,
    "sub":sub,
    "topic":topic,
    "user_name":user_name
  })

  const data =respond.data;
res.render("sorce_video/resource_for_student.ejs",{
  "dept":dept, 
  "sub":sub,
  "topic":topic,
  "data":data
})
})


// add a link for student in data base

server.post("/:dept/:sub/student/own_work/:topic/link_res",async(req,res,next)=>{
  try{
    const dept =req.params.dept;
    const sub=req.params.sub;
    const topic = req.params.topic;
    const user_name = req.user.username;

    console.log(req.body);
    const respond = await axios.post(`${domain}stu_add_topic_link`,{
    "dept":dept,
    "sub":sub,
    "topic":topic,
    "user_name":user_name,
    "body":req.body
    })
   res.redirect((`${our_domain}${dept}/${sub}/student/own_work/${topic}/link_res`));
}catch(err){
    res.send(err);
}
  })


  // add a video for student in data base

  server.post("/:dept/:sub/student/own_work/:topic/video_res",async(req,res,next)=>{
    try{
      const dept =req.params.dept;
      const sub=req.params.sub;
      const user_name = req.user.username;
      const topic = req.params.topic;

      console.log(req.body);
      const respond = await axios.post(`${domain}stu_add_topic_video`,{
      "dept":dept,
      "sub":sub,
      "topic":topic,
      "user_name":user_name,
      "body":req.body
      })
      res.redirect((`${our_domain}${dept}/${sub}/student/own_work/${topic}/video_res`));
  }catch(err){
      res.send(err)
  } 
  })

// add a document for student in data base


server.post("/:dept/:sub/student/own_work/:topic/doc_res",upload.single('file'),async(req,res)=>{
  try{
    const dept =req.params.dept;
    const  sub=req.params.sub;
    const topic = req.params.topic;
    const user_name = req.user.username;

    const fileType = getFileType(req.file.originalname);
    let iconClass = "";

    switch (fileType) {
      case "PDF Document":
        iconClass = "fa-solid fa-file-pdf";        
        break;
      case "JPG Image":
      case "PNG Image":
        iconClass = "fa-solid fa-image"; 
        break;
      case "Microsoft Word Document x":
      case "Microsoft Word Document":
        iconClass = "fa-solid fa-file-word";
        break;
      case "Microsoft PowerPoint Presentation":
      case "Microsoft PowerPoint Presentation x":
        iconClass = "fa-light fa-file-ppt";
        break;
      case "MP4 Video":
        iconClass = "fa-solid fa-play";
        break;
      default:
        iconClass = "fa-solid fa-file-pdf"; 
    }
    console.log(req.body);
    console.log(req.file);
    const respond = await axios.post(`${domain}stu_add_topic_doc`,{
        "dept":dept,
        "sub":sub,
        "user_name":user_name,
        "topic":topic,
        "buffer_base64":Buffer.from(req.file.buffer).toString('base64'),
        "file":req.file.originalname,
        "doc_title":req.body.topic,
        "description":req.body.description,
        "iconClass": iconClass
    })


res.redirect((`${our_domain}${dept}/${sub}/student/own_work/${topic}/doc_res`));
    }catch(err){
        res.send(err)
    } 
})

// show pdf for student


server.get("/:dept/:sub/student/own_work/:topic/doc_res/show_doc",async(req,res)=>{

   const dept =req.params.dept;
    const  sub=req.params.sub;
    const user_name = req.user.username;
   const topic = req.params.topic;

   const respond = await axios.post(`${domain}stu_show_pdf`,{
       "dept":dept,
       "sub":sub,
       "user_name":user_name,
       "topic":topic,
       "file_n":req.query
   });

console.log(req.query['file_name']);
console.log(respond.data.document)
   const data = respond.data.document;
   const fileType = getFileType(req.query['file_name']);
   switch (fileType) { 
      case "PDF Document":
        res.send(`<embed src="data:application/pdf;base64,${data}" type="application/pdf" " style="background-color:black;height:100vh;width:100%">`);
        break;
      case "JPG Image":
        res.send(`<img src="data:image/jpeg;base64,${data}" alt="JPG Image" style="background-color:black;height:100vh;width:100%">`);
        break;
      case "PNG Image":
        res.send(`<img src="data:image/png;base64,${data}" alt="PNG Image">`);
        break;
      case "Microsoft PowerPoint Presentation x":
        const pptxBuffer = Buffer.from(data, 'base64');
        res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
        res.set('Content-Disposition', `attachment; filename="${req.query['file_name']}"`);
        res.send(pptxBuffer);
        break;
      case "Microsoft Word Document x":
        const docxBuffer = Buffer.from(data, 'base64');
        res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.set('Content-Disposition', `attachment; filename="${req.query['file_name']}"`);
        res.send(docxBuffer);
        break;
      case "Microsoft Word Document":
        const docBuffer = Buffer.from(data, 'base64');
        res.set('Content-Type', 'application/msword');
        res.set('Content-Disposition', `attachment; filename="${req.query['file_name']}"`);
        res.send(docBuffer);
        break;
      case "Microsoft PowerPoint Presentation":
        const pptBuffer = Buffer.from(data, 'base64');
        res.set('Content-Type', 'application/vnd.ms-powerpoint');
        res.set('Content-Disposition', `attachment; filename="${req.query['file_name']}"`);
        res.send(pptBuffer);
        break;  
        case "MP4 Video":
          const mp4Buffer = Buffer.from(data, 'base64');
          res.set('Content-Type', 'video/mp4');
          res.send(mp4Buffer);
          break;
      default:
        res.status(400).send('Unsupported file type');
    }
// }catch(err){
//    console.log(`this is ${err}`);

// }
})


server.get("/:dept/:sub/:unit/:topic/delete_topic",async(req,res)=>{
  console.log(req.params);
  const dept =req.params.dept;
  const sub=req.params.sub; 
  const unit =req.params.unit; 
  const topic = req.params.topic; 
    

  const respond = await axios.post(`${domain}delete_topic`,{
    "dept":dept,
    "sub":sub,
    "unit":unit,
    "topic":topic 
  })
res.redirect(`${our_domain}${dept}/${sub}/${unit}`);

})   

server.get("/:dept/:sub/student_work/own_work/:topic/delete",async(req,res)=>{

  const dept =req.params.dept;
  const sub=req.params.sub; 
  const topic = req.params.topic;
  const user = req.user.username;  
console.log(req.params); 
const respond = await axios.post(`${domain}stu_delete_topic`,{
  "dept":dept, 
  "sub":sub,
  "topic":topic,  
  "user_name":user 
})
res.redirect(`/${dept}/${sub}/student/own_work`);
})



// passport.use(  
//     "local",
//     new Strategy(async function verify(username, password, cb) {
//       try { 
//         let result = await axios.post(`${domain}login/auth`,{
//             "username":username
//         }
//         );
//         if (result.data.length > 0) {
//             const user = result.data[0];
//           const storedHashedPassword = user.password;
//           console.log(storedHashedPassword);
  
//               bcrypt.compare(password, storedHashedPassword, (err, valid) => {
//                 if (err) {
//                   console.error("Error comparing passwords:", err);
//                   return cb(err);
//                 } else {
//                   console.log(valid);
//                   if (valid) {
//                     return cb(null, user);
//                   } else {
//                     return cb(null, false);
//                   }
//                 }
//               });

//         } else {
//           return cb("User not found");
//         }
//       } catch (err) {
//         console.log(err);
//       }
//     })
//   );
passport.use(
  "local",
  new Strategy(async function verify(username, password, cb) {
    try { 
      let result = await axios.post(`${domain}login/auth`, { "username": username });
      if (result.data.length > 0) {
        const user = result.data[0];
        bcrypt.compare(password, user.password, (err, valid) => {
          if (err) {
            return cb(err);
          }
          if (valid) {
            return cb(null, user);
          } else {
            return cb(null, false);
          }
        });
      } else {
        return cb("User not found");
      }
    } catch (err) {
      console.error("Error during login authentication:", err);
      return cb(err);
    }
  })
);

// Ensure trimming is consistent
server.post("/login", passport.authenticate("local", {
  successRedirect: "/iot",
  failureRedirect: "/log_in",
}));
  passport.serializeUser((user, cb) => {
    cb(null, user);
  });
  
  passport.deserializeUser((user, cb) => {
    cb(null, user);
  });



server.listen(port,()=>{
    console.log(`sever is running in port ${port}`);
});


//functions for backend

function subject_join(arr,sub) {

  let arr_join = []
  for(let i=0;i<arr.length;i++){
      arr_join = arr_join.concat(arr[i])
  }
  return arr_join.includes(sub);
}



//find which type of file is this
function getFileType(filename) {
  // Get the file extension
  const extension = filename.split('.').pop().toLowerCase();

  // Define mappings of file extensions to file types
  const fileTypes = {
    'pdf': 'PDF Document',
    'doc': 'Microsoft Word Document',
    'docx': 'Microsoft Word Document x',
    'ppt': 'Microsoft PowerPoint Presentation',
    'pptx': 'Microsoft PowerPoint Presentation x',
    'jpg': 'JPG Image',
    'jpeg': 'JPEG Image',
    'png': 'PNG Image',
    'gif': 'GIF Image',
    'mp4': 'MP4 Video',
  };

  // Check if the extension exists in the fileTypes object
  if (fileTypes.hasOwnProperty(extension)) {
      return fileTypes[extension];
  } else {
      return 'Unknown File Type';
  }
}
