String.prototype.sayHi=function(){

    console.log('hi')
}
String.prototype.whereAreYou=function(){

    console.log(this +' here')
}
String.prototype.NumFormat=function(num){

    console.log(num+".00")
}


let a="vivek";

a.sayHi();
a.whereAreYou()
a.NumFormat(100)