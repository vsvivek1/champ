import { setInterval } from 'core-js/js';
import vue from 'vue';

import getCurrentFNOPositions from './getCurrentFNOPositions'

export default{

    mixins:[getCurrentFNOPositions],

mounted(){


    setInterval(()=>{


        console.log(this.getCurrentFNOPositions(),'pos');
        

        //getorders
        //getPositions
        // if no orders or postion  / set enter now to trade =false




    },10000)
}

}