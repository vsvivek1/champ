<template>
    <div>

        
      <p class="text-success" v-if="isOnline">You are online</p>
      <p class="text-danger" v-else>You are offline</p>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        isOnline: navigator.onLine // Initial status
      };
    },
    methods: {
      updateOnlineStatus() {
        this.isOnline = navigator.onLine;
      }
    },
    created() {
      window.addEventListener('online', this.updateOnlineStatus);
      window.addEventListener('offline', this.updateOnlineStatus);
    },
    beforeDestroy() {
      window.removeEventListener('online', this.updateOnlineStatus);
      window.removeEventListener('offline', this.updateOnlineStatus);
    }
  };
  </script>
  
  <style>
  /* Add any styles you need */
  </style>
  