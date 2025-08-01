<template>
  <ul>
    <li v-for="(status, strategy) in strategyStatuses" :key="strategy">
      <strong>{{ strategy }}:</strong>
      <span :style="{ color: getColor(status) }">{{ getLabel(status) }}</span>
    </li>
  </ul>
</template>

<script>
export default {
  name: "StrategyStatus",
  props: {
    strategyStatuses: {
      type: Object,
      required: true
    }
  },
  methods: {
    getLabel(status) {
      if (status === "Activated") return "✅ Activated";
      if (status === "unFulfilled") return "❌ Unfulfilled";
      if (status === "checking" || status === "untouched" || status === "touched")
        return "🔍 Checking";
      return status;
    },
    getColor(status) {
      if (status === "Activated") return "green";
      if (status === "unFulfilled") return "red";
      return "orange";
    }
  }
};
</script>
