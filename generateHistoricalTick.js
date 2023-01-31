const ticks=require('./appv3/public/instruments/ticks.json')

setInterval(()=>{

    let tick=ticks.pop()

    console.log(tick)


},500)