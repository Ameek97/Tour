const nodemailer= require("nodemailer");

// options is a js object

const sendEmail = async options=>{

// 1) create a transporter-> set the email from which the email would be sent

const transporter= nodemailer.createTransport({
   // the field names such as host etc should be exact as these are expected by the nodemailer
    host:process.env.EMAIL_HOST,
    port:Number(process.env.EMAIL_PORT),
    
 auth:{
    user:process.env.EMAIL_USERNAME,
    pass:process.env.EMAIL_PASSWORD,
}
});

 const mailoptions={
    from: "ameek <ameekajaz2@gmail.com>", 
    to:options.email,
    subject: options.subject,
    text:options.message
 }

 await transporter.sendMail(mailoptions);

}

module.exports= sendEmail;