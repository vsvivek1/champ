let d=new Date();
d.setDate(d.getDate())
d.setMonth(d.getMonth()+1);

let index={1:-4,2:-5,3:-6,4:0,5:-1,6:-2}
d.setDate(0);
let lastDaysWeekDay=d.getDay()
let out=index[lastDaysWeekDay]

d.setDate(d.getDate()+out);

let d1= d.toISOString().split('T')[0];

return d1











// today.setDate(today.getDate()+26)

console.log('final',d,d.getDay());

// console.log(d)

return 

if(d>today){
    console.log(d,out,'less')

}


else{

    console.log(d,out,'even over ')
    console.log('over',d)
    d.setMonth(d.getMonth()+2);
    
    d.setDate(0);

    
    
    let day=5-d.getDay();

    console.log(d,'now',day)
    
    d.setDate(d.getDate()-day)

    console.log(d,d.getDay())
   


}
