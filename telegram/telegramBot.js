const TelegramBot = require('node-telegram-bot-api');
const token = '2042279965:AAGudvLvwhEzbiz2G8f-RmeeADvzk0aY8YE';

const axios=require('axios');

let channelName="@FreeIntradayBot"

let chat_id;






let url= `https://api.telegram.org/bot${token}/getUpdates`;





 axios.get(url).then(r=>{
chat_id=r.data.result[0].channel_post.chat.id;
       console.log('from bot ',r.data.result[0].channel_post.chat.id)


       sendMsg(chat_id)
  
  
  
  
    }).catch(e=>e) 





    function sendMsg(chat_id){

        let urlToSendMessage=`https://api.telegram.org/bot${token}/sendMessage`;

        let obj={};
        obj.chat_id=chat_id;
    
        console.log('obj.chat_id',obj.chat_id)
        obj.text=`
        
        <a href="#" data-kite="your_api_key"
                data-exchange="NSE"
                data-tradingsymbol="SBIN"
                data-transaction_type="BUY"
                data-quantity="1"
                data-order_type="MARKET">Buy SBI stock</a>`;
    
                // obj.text=`test`;
    
    
    
            // console.log(urlToSendMessage);
            axios.post(urlToSendMessage,obj).then(r=>{
        
                console.log('from bot ',r.data.result[0])
        
                
            }).catch(e=>e)

    }

    



// setInterval(()=>{
   
    



// },100)





// const bot = new TelegramBot(token, {polling: true});
// bot.on('message', (msg) => {

//     console.log(msg)
// var Hi = "hi";
// if (msg.text.toString().toLowerCase().indexOf(Hi)  === 0) {
//     bot.sendMessage(msg.chat.id, "Hello  " + msg.from.first_name);
// }});