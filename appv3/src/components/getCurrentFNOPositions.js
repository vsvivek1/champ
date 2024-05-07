import vue from 'vue';
import axios from 'axios'

export default{

    methods:{
        async getCurrentFNOPositions() { 
          let url  =  "/api/getPositions";
let obj={}
            // call after get live orders
      
           
           
            
            obj.accessToken  =  this.accessToken;
            return axios.post( url, obj ).then( async ( res )  => res.data);
      
          
          
           } ,


    }


}