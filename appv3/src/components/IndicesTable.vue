<template>
    <div>
<!-- {{  indices  }}  -->



<ul>

  <li v-for="( i, index ) in indices" :key="index">
 
   {{ index+1 }}  
        {{ i.tradingsymbol }}  -
        ( {{ i.instrument_token }}  ) -
     {{ i.last_price }}  -
   {{ i.pricePoints.d0.range }} 
  
  </li>
</ul>


    </div>
</template>

<script>
    export default { 
        name:'IndicesTable',
        props:{ indices:Array } ,
        methods:{ 

            checkNiftyStatus( index ){ 


          

let pp= this.indices.filter( i=>i.tradingsymbol == index )[0]

// return pp.pricePoints.d0;

if( pp.last_price!=0 ){ 

    let changePc=
(  ( pp.last_price-pp.pricePoints.d0.open )/pp.pricePoints.d0.open )
        .toFixed( 1 )*100   
        
        
        let change=pp.pricePoints.d0.close
//  ( pp.last_price-pp.pricePoints.d0.close )
       



        let res={  } ;

        res.changePc=changePc
        res.change=change
return pp

 } else{ 

return { 
    changePc:'na',
    change:'na',

 } 

 } 

 } ,

         } 
     } 
</script>

<style lang="scss" scoped>
table { 
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
 } 

</style>