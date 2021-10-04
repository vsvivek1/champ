import axios from 'axios';
export default{

methods:{


    PlaceBracketOrderInServer(accessToken,SymbolsArray){


        let arr=JSON.stringify(SymbolsArray)
        let url="/api/PlaceBracketOrderInServer/";
        let resultPromise= axios.post(url).then(res => {    
                        return res.data;                  
             
             });

             return resultPromise;
        
        },   getOHLC(accessToken,SymbolsArray){


        let arr=JSON.stringify(SymbolsArray)
        let url="/api/getOHLC/symbols/"+ arr+'/accessToken/'+accessToken;;
        let resultPromise= axios.get(url).then(res => {    
                        return res.data;                  
             
             });

             return resultPromise;
        
        },  
        
        getHistoricalData(accessToken,symbol,start,end,intervel){


        let url="/api/getHistoricalData/symbol/"+ symbol+'/accessToken/'+accessToken+'/start/'+start+'/end/'+end+'/intervel/'+intervel;
        let resultPromise= axios.get(url).then(res => {    
                        return res.data;                  
             
             });

             return resultPromise;
        
        },
}

}