<template>
    <div>


    <table class="table table compact table bordered">
        <thead>
            <th>#</th>
            <th>index</th>
            <th>LTP</th>
            <th>Change</th>
            <th>Change%</th>
        </thead>
        <tbody>
            <tr v-for="(i,index) in indices" :key="index">
                <td>{{index+1}}</td>
                <td>{{i.tradingsymbol}}</td>
                <td>
{{i.last_price}}

                </td>
                <td>

              
{{i.last_price-i.pricePoints.d0.open

}}


open{{i.pricePoints.d0.open}}
<v-chip>

    {{ checkNiftyStatus(i.tradingsymbol) }}
    date
 
{{

 
checkNiftyStatus(i.tradingsymbol).normalDate}}//change
{{checkNiftyStatus(i.tradingsymbol).change}}//
{{checkNiftyStatus(i.tradingsymbol).changePc}}// changepc
{{checkNiftyStatus(i.tradingsymbol).high}}// low


{{checkNiftyStatus(i.tradingsymbol).low}}//



</v-chip>

                </td>
                <td></td>
            </tr>
        </tbody>
    </table>

    </div>
</template>

<script>
    export default {
        name:'IndicesTable',
        props:{indices:Array},
        methods:{

            checkNiftyStatus(index){


          

let pp= this.indices.filter(i=>i.tradingsymbol==index)[0]

// return pp.pricePoints.d0;

if(pp.last_price!=0){

    let changePc=
( (pp.last_price-pp.pricePoints.d0.open)/pp.pricePoints.d0.open)
        .toFixed(1)*100   
        
        
        let change=pp.pricePoints.d0.close
//  (pp.last_price-pp.pricePoints.d0.close)
       



        let res={};

        res.changePc=changePc
        res.change=change
return pp

}else{

return {
    changePc:'na',
    change:'na',

}

}

},

        }
    }
</script>

<style lang="scss" scoped>

</style>