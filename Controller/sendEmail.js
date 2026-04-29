const nodemailer= require("nodemailer");

// options is a js object

const sendEmail = async options=>{

// 1) create a transporter-> set the email from which the email would be sent

const transporter= nodemailer.createTransport({

    host:process.env.EMAIL_HOST,
    port:process.env.EMAIL_PORT,
    
 auth:{
    username:process.env.EMAIL_USERNAME,
    password:process.env.EMAIL_PASSWORD,
}
});

 const mailoptions={
    from: "ameek <ameekajaz2@gmail.com>", 
    to:options.email,
    subject: options.subject,
    message:options.message
 }

 await transporter.sendMail(mailoptions);

}

module.exports= sendEmail;