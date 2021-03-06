const app = require("../../NextApp");
const User = require("../../models/User");
const Post = require("../../models/Post");
const Balance = require("../../models/Balance");
const Miner = require("../../models/Miner");
const config = require("../../config");

function home(router){
    router
    .get('/', async ctx => {
        
        const user = await User.findOne({email: config.superAdmin.email});
        
        let balance = await Balance.findOne({user: user._id});
        if(!balance){
           balance =  await Balance.create({
                user,
                amount: 0
            })
        }
                
        //是否有矿机
        const minerCount = await Miner.count({balance, type: "personal"});
        
        if(minerCount===0){
            await Miner.create({
                balance,
                name: "个人矿机",
                cost: 0,
            })
        }

       const personalMiner  = await Miner.findOne({balance, type: "personal"});
       ctx.query.minerCount = minerCount;
       ctx.query.balance = balance;
       ctx.query.personalMiner = personalMiner;
        await app.render(ctx.req, ctx.res, '/', ctx.query);
        ctx.respond = false;
    })
    .get('/:email', async ctx => {
        const { email } = ctx.params;
        const user = await User.findOne({email});
        const posts = await Post.find({user});
        ctx.query.posts = posts;
        ctx.query.user = user;
        if(user){
            await app.render(ctx.req, ctx.res, '/user/index', ctx.query);
            ctx.respond = false;
        }else{
            await app.render(ctx.req, ctx.res, '/404', ctx.query);
            ctx.respond = false;
        }
       
    })
   
}

module.exports = home;