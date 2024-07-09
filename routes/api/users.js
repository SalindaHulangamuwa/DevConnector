const express = require('express');
const router = express.Router();
const gravator = require('gravator');
const bcrypt = require ('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require ('config');
const {check,validationResult}=require('express-validatior/check')
const User = require('../../models/User');


router.post('/',[
    check('name','name is required').not().isEmpty(),
    check('email','please include a valid e mail').isEmail(),
    check('password','please enter a password with 6 or more characters').isLength({min:6})
],async(req,res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

    const{name,email,password} = req.body;
    try{
        let user = await User.findOne({email});
        if(user){
          res.status(400).json({error:[{msg:'user already exist'}]});
        }

        const avatar = gravator.url(email,{
            s:'200',
            r:'pg',
            d:'mm'
        })
        user = new User({
            name,
            email,
            avatar,
            password
        })

        const salt= await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(passwprd,salt);
        await user.save();

        const payload ={
            user:{
                id:user.id
            }
        }

        jwt.sign(
            payload,
            config.get('jwtSecret'),
            {expiresIn:360000},
            (err,token)=>{
            if(err) throw err;
            res.json({token});
        })

        res.send('User registered');


    }catch(error){
        console.log(err.message);
        res.status(500).send('server error');

    }
   }
);

module.exports = router;