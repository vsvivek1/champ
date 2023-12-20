import store from '@/store';
export default{ 

    methods:{ 

        getSessionDetailsFromCookies(  ){ 
        
          //console.log( 'session from cookies',this.$cookie.get( 'session' ))
        
        this.session=JSON.parse( this.$cookie.get( 'session' ));
        this.accessToken=this.$cookie.get( 'accessToken' );
        
         } ,
        
           } ,
          mounted(  ){ 

            // console.log( 'session',this.session )
        
        this.getSessionDetailsFromCookies(  );

        // console.log( 'this.session',this.session )

        if( this.session == null ){ 

          this.$router.push( '/' );
         } 
        
           } ,
          computed:{ 

            session:{ 
get(  ){ 

  return store.state.session;
 } ,
set( val ){ 

  store.commit( 'setSession',val )
 } 

           } ,
          accessToken:{ 
get(  ){ 

  return store.state.accessToken;
 } ,
set( val ){ 

  store.commit( 'setAccessToken',val )
 } 

           } ,
         } 

 } 