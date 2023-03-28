const express = require('express')
// const multer = require('multer');
const Reguser = require('../models/Reguser')
const uuid = require('uuid');
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const router = express.Router();
const saltRounds = 10;
var Privatekey = "MIICXAIBAAKBgQCRV0EgAVN9pqLfvrUSzGXFeqaJpalBDblvbzKGpLLnYaOt/qOWCquDkugKhkf+Da+3KoZYOLcdsJr5KBclvpCGA2bRxLBl41kF6/6jFU0TdTcXb7mHdfr8hvnxTQB4t1whxJRRyc0rOYZShL/YJQIVe+6oZRPhae//xrGbT2Ou3QIDAQABAoGABLuInVgttcu1Rf/ZuZD6R2HlBlpkln+x6BUA2i2Gvc4KHGJMRVh3mUMxVxZkRbuAW0CBO2ItZEQZ578McegwoH+6QYI11amJGtqqqTZUrgDxUQX9OvnUZqI0H5UQ9nwfD230tzmFRU8aRwtnSaURijzQROHLWKjF79dIKo/EQakCQQDnhersypNlhQOS916O97NhJMX8vBDDvhc3WB2/kifGGs04Lx1K9KUYfdFbkRVPi6rDTg5l1mnV1WDateUeXzFTAkEAoLTY3yydiywD0JG4DLRYcjQm02jVlFJu9JwYBz9YQAFS/KmulsdjxmQjY3HQd4J/EonYXrPvhtYrIbnARsCpDwJADPYlWc5ZhCR3N8IbjBt38mdRoj2RHrRErneDatcu3NthQ9T3advaZk2c6+hqbgKes8Jp8e+YCz2f536pbhLcOwJACa26nf5G4rnc5PPRvNojtYUUjYjzzAIG8q5v+AfFnd02jUb+38/UX39qbjPNlVUDqC8rG9EEbP97C4XvYZN62wJBALn9oqUN876PhQwNAlpsD7T2ebpFVnXjEl8dziFFTjtHXQ7s2zc8BOO9XAod0H9oupQc2KLqBmoG6McjR9Mv2AE="

// const storage = multer.diskStorage({
//     destination: (req, file, callback) => {
//         callback(null, "../userdashboard/public/uploads")  
//     },
//     filename: (req, file, callback) => {
//         callback(null, file.originalname);
//     }

// })

// const upload = multer({storage : storage})

router.get('/Getuser', async (req, res) => {
    try {
        let userData = await Reguser.find()

        let finaldata = {
            "users": userData,
            "userlength": userData.length
        }

        res.status(200).json({ 'status': 200, 'data': finaldata, 'message': 'successfully fetched Data', 'error': false })
    }
    catch (error) {
        res.status(400).json({ 'status': 400, 'message': error.message, 'error': true })
    }
})

router.post('/Adduser', async (req, res) => {
    try {
        var reqdata = req.body;

        const ExistingEmail = await Reguser.findOne({ Email: reqdata.Email }).countDocuments();

        if (ExistingEmail) {
            throw new Error("Email already exists")
        }

        const enpPassword = bcrypt.hashSync(reqdata.Password, saltRounds);

        delete reqdata.Password;

        var token = jwt.sign(reqdata, Privatekey)

        let finaldata = new Reguser({
            id: uuid.v4(),
            Firstname: reqdata.firstname,
            Lastname: reqdata.lastname,
            Email: reqdata.email,
            Password: enpPassword,
            Token: token
        })

        let regdata = await finaldata.save()
        sendMail(reqdata)
        res.status(200).json({ 'status': 200, 'data': regdata, 'message': 'successfully posted', 'error': false })
    }
    catch (error) {
        res.status(400).json({ 'status': 400, 'message': error.message, 'error': true })
    }
})

router.post('/login', async (req, res) => {
    try {

        var reqdata = req.body;

        if (Object.keys(reqdata).length === 0) {
            throw new Error("please provide data.");
        }

        const ExistingEmail = await Reguser.findOne({ Email: reqdata.Email }).countDocuments();

        if (ExistingEmail) {

            var userData = await Reguser.findOne({ Email: reqdata.Email });
            const depPassword = bcrypt.compareSync(reqdata.Password, userData.Password);
            console.log(userData)
            if (depPassword) {
                delete userData.Password;
                var token = jwt.sign({ userData }, Privatekey)
                userData.Token = token;

                await Reguser.findOneAndUpdate({ Email: reqdata.Email }, { user_token: token });
                res.status(200).json({ "status": 200, "data": userData, "message": "Login successfully", "error": false })

            } else {
                throw new Error("password not matched..")
            }

        } else {
            throw new Error("Email already exist.")
        }


    } catch (error) {
        res.status(400).json({ "status": 400, "message": error.message, "error": true })
    }
})

router.get('/getUserDetails', async (req,res) => {
    try{
      const header = req.headers['authorization']?.split(' ')[1]

      if(!header){
        throw new Error('no header is here')
      }

      var decoded = jwt.verify(header, Privatekey);

      if(!decoded){
        throw new Error('no token here')
      }
      console.log(decoded);
      var user = await Reguser.findOne({id:decoded.userData.id})

      if(!user){
        throw new Error('no user found')
      }

      res.status(200).json({ 'status': 200, 'data': user, 'message': 'successfully fetched Data', 'error': false })
    }
    catch(error){
        res.status(400).json({ 'status': 400, 'message': error.message, 'error': true })
    }
})

router.put('/Edituser/:id', async (req, res) => {
    try {
        var reqdata = req.body;
        let checkUser = await Reguser.findOne({id: req.params.id});
        if(!checkUser){
          throw new Error('User not Exist..')
        }
        let saveData = await Reguser.findOneAndUpdate({id: req.params.id},reqdata,{new:true})
        console.log(saveData)
        res.status(200).json({ 'status': 200, 'data': saveData, 'message': 'successfully User Details updated', 'error': false })
    }
    catch (error) {
        res.status(400).json({ 'status': 400, 'message': error.message, 'error': true })
    }
})

// router.get('/sendmail', async (req, res) => {
//     try {
//         const transporter = nodemailer.createTransport({
//             host: 'smtp.gmail.com',
//             port: 587,
//             secure: false,
//             auth: {
//                 type: "OAuth2",
//                 user: 'itspktechie@gmail.com',
//                 pass: 'PrEm@879',

//                   clientId: '900586675313-tf9tcqhmbhb7s870lifequ3q0v9ddicj.apps.googleusercontent.com',
//                   clientSecret: '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',
//                   refreshToken: '1//04DAWZ9-yzkx2CgYIARAAGAQSNwF-L9IrekQn8p_UA_UU1JoM8lXv-2g5a-Sx9DE29J61_8QKiac2ReIimC-BR_zAk-JMldfjW6U'
//             }
//         });
//         const mailConfigurations = {
//             from: 'itspktechie@gmail.com',
//             to: 'premkumarr393@gmail.com',
//             subject: 'Sending Email using Node.js',
//             html: "<h1>hi iam pk...</h1>"
//         };
//         transporter.sendMail(mailConfigurations, function (error, info) {
//             console.log(error);
//             if (error) throw new Error(error);
//             console.log('Email Sent Successfully');
//             console.log(info);
//         });
//         res.status(200).json({ 'status': 200, 'data': '', 'message': 'successfully fetched Data', 'error': false })

//     }
//     catch (error) {
//         res.status(400).json({ "status": 400, "message": error.message, "error": true })
//     }
// })

// router.put('/Edituser/:id', async (req, res) => {
//     try {
//         var reqdata = req.body;
//         let checkUser = await userdetails.findOne({id: req.params.id});
//         if(!checkUser){
//           throw new Error('User not Exist..')
//         }
//         let saveData = await userdetails.findOneAndUpdate({id: req.params.id},reqdata,{new:true})
//         console.log(saveData)
//         res.status(200).json({ 'status': 200, 'data': saveData, 'message': 'successfully User Details updated', 'error': false })
//     }
//     catch (error) {
//         res.status(400).json({ 'status': 400, 'message': error.message, 'error': true })
//     }
// })

// router.delete('/Deleteuser/:id', async (req, res) => {
//     try {
//         let checkUser = await userdetails.findOne({id: req.params.id});
//         if(!checkUser){
//           throw new Error('User not Exist..')
//         }
//         let Deletedata = await userdetails.findOneAndDelete({id: req.params.id})
//         console.log(Deletedata)
//         res.status(200).json({ 'status': 200, 'data': Deletedata, 'message': 'Deleted successfully', 'error': false })
//     }
//     catch (error) {
//         res.status(400).json({ 'status': 400, 'message': error.message, 'error': true })
//     }
// })

// router.post('/pagination', async (req, res) => {
//     try {
//         var {page} = req.body;
//         console.log(page);
//         page = page ? page : 0;

//         const Itemperpage = 5;

//         var skip = Itemperpage * page;
//         console.log(skip)

//         var tempdata = {};

//         var pageCheck = await userdetails.aggregate([
//             {
//                 $match : tempdata,
//             },
//         ])
//         var pageCount = pageCheck.length;
//         console.log(pageCount);

//         var pages = await userdetails.aggregate([
//             {
//                 $match: tempdata,
//             },
//         ]).skip(skip).limit(Itemperpage)

//         var nextPage = (skip + Itemperpage < pageCount) ? true : false

//         var totalpage = Math.ceil(pageCount / Itemperpage);

//         var finalpageData = {
//             userpages : pages,
//             currentPage : page,
//             totalpage : totalpage,
//             nextPage: nextPage
//         }
//         res.status(200).json({ 'status': 200, 'data': finalpageData, 'message': 'Pages fetched', 'error': false })
//     }
//     catch (error) {
//         res.status(400).json({ 'status': 400, 'message': error.message, 'error': true })
//     }
// })

// router.get('/sendmail', async (req, res) => {
//     try {
//         let transporter = nodemailer.createTransport({
//             host: 'smtp.gmail.com',
//             port: 587,
//             secure: false, // true for 465, false for other ports
//             auth: {
//                 user: 'premmathaiyan879@gmail.com',
//                 pass: ''
//             }
//         });
        
//         // setup email data with unicode symbols
//         let mailOptions = {
//             from: '"Prem kumar" <premmathaiyan879@gmail.com>', // sender address
//             to: 'itspktechie@gmail.com', // list of receivers
//             subject: 'Test email', // Subject line
//             text: 'Hello world?', // plain text body
//             html: '<b>Hello world?</b>' // html body
//         };
        
//         // send mail with defined transport object
//        await  transporter.sendMail(mailOptions, (error, info) => {
//             if (error) {
//                 console.log(error);
//             } else {
//                 console.log('Message sent: %s', info.messageId);
//             }
//         });
//         res.status(200).json({ 'status': 200, 'data': '', 'message': 'successfully fetched Data', 'error': false })

//     }
//     catch (error) {
//         res.status(400).json({ "status": 400, "message": error.message, "error": true })
//     }
// })

function sendMail(data){
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            type: "OAuth2",
            user: 'itspktechie@gmail.com',
            pass: 'PrEm@879',

              clientId: '900586675313-tf9tcqhmbhb7s870lifequ3q0v9ddicj.apps.googleusercontent.com',
              clientSecret: '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',
              refreshToken: '1//04DAWZ9-yzkx2CgYIARAAGAQSNwF-L9IrekQn8p_UA_UU1JoM8lXv-2g5a-Sx9DE29J61_8QKiac2ReIimC-BR_zAk-JMldfjW6U'
        }
    });
    const mailConfigurations = {
        from: 'itspktechie@gmail.com',
        to: ['premkumarr393@gmail.com',data.email],
        subject: data.firstname + data.lastname + ' user register',
        html: "<h1>hi iam pk...</h1>"
    };
    transporter.sendMail(mailConfigurations, function (error, info) {
        console.log(error);
        if (error) throw new Error(error);
        console.log('Email Sent Successfully');
        console.log(info);
    });
}

module.exports = router;