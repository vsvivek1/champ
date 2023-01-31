// function sendEmail() {
// 	Email.send({
// 	Host: "smtp.gmail.com",
// 	Username : "vs.vivek1@gmail.com",
// 	Password : "..vikram@1234",
// 	To : 'vs.vivek1@gmail.com',
// 	From : "sender’s email address",
// 	Subject : "janeman",
// 	Body : "off line",
// 	}).then(
// 		message => alert("mail sent successfully")
// 	);
// }
<script>
var a; setInterval(()=>{a=document.querySelector("[title='online']");
console.log(a,'a')
if(typeof a!='undefined')
if(a!=null)
{  console.log('janeman online',a);

let audioLink="https://notificationsounds.com/storage/sounds/file-sounds-1219-magic.mp3"

var audio = new Audio(audioLink);
audio.play();

}
else
{
    console.log('jamenam offline')

	var audio = new Audio(audioLink);
audio.play();

 
}

},5*1000);
</script>


var a; setInterval(()=>{document.querySelector("#side");if(a!=null)
{  console.log('janeman online'); var audio = new Audio('https://interactive-examples.mdn.mozilla.net/media/examples/t-rex-roar.mp3');audio.play();}else{console.log('jamenam offline')}},3000);


