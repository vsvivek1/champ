<template>
    <div>
        <div v-for="(instrument, index) in instruments" :key="index">
            <p>Trading Symbol: {{ instrument.tradingsymbol }}</p>
            <p>Last Price: {{ instrument.last_price }}</p>
            <p>Status: {{ instrument.status }}</p>
            <hr>
        </div>
    </div>
</template>

<script>
export default {
    name: 'InstrumentsStatusView',
    props: {
        instruments: {
            type: Array,
            required: true
        }
    },
    data() {
        return {
            // You can define data properties here if needed
        };
    },
    methods: {
        // You can define methods here if needed
    },
    computed: {
        // You can define computed properties here if needed
    }
};
</script>
