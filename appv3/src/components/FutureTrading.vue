<template>
    <div>
      <p v-if="!loading && instruments.length === 0">No instruments found</p>
      <ul v-if="!loading">
        <li v-for="instrument in instruments" :key="instrument.tradingsymbol">{{ instrument.tradingsymbol }}</li>
      </ul>
      <p v-if="loading">Loading...</p>
    </div>
  </template>
  
  <script>
  import sessionMixin from "@/views/sessionMixin";
  export default {
    mixins:[sessionMixin],
    data() {
      return {
        instruments: [],
        loading: true,
        propertyNames:['NIFTY','BANKNIFTY']
      }
    },
    async created() {
      const url = '/instruments/instrumentsAll.json';
      const response = await fetch(url);
      const data = await response.json();
      const filteredData = data.filter(instrument => {
        return (
          instrument.segment === 'NFO-FUT' &&
          instrument.exchange === 'NFO' &&
          instrument.instrument_type === 'FUT' &&
          this.propertyNames.includes(instrument.name) &&
          
          instrument.expiry=='2023-03-29'

        );
      });
      this.instruments = filteredData;
      this.loading = false;
    },
    props: {
    //   propertyNames: {
    //     type: Array,
    //     required: true,
      //},
    },
  };
  </script>
  