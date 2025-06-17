#!/bin/bash

echo "🚫 Removing Vuetify from your Vue 2 project..."

# 1. Uninstall Vuetify packages
echo "📦 Uninstalling Vuetify and related plugins..."
yarn remove vuetify vue-cli-plugin-vuetify vuetify-loader 2>/dev/null || npm uninstall vuetify vue-cli-plugin-vuetify vuetify-loader

# 2. Remove Vuetify plugin file
echo "🗑️ Deleting plugin file (if present)..."
rm -f src/plugins/vuetify.js

# 3. Remove Vuetify import lines from main.js
echo "✂️ Cleaning up main.js..."
sed -i '/vuetify/d' src/main.js
sed -i '/Vuetify/d' src/main.js
sed -i "/import 'vuetify\/dist\/vuetify.min.css'/d" src/main.js

# 4. Remove Vuetify-related lines from App.vue (style tags)
echo "🧹 Cleaning Vuetify CSS references in App.vue..."
sed -i "/vuetify.min.css/d" src/App.vue

# 5. Remove VuetifyLoaderPlugin from vue.config.js or webpack.config.js
echo "🧼 Removing VuetifyLoaderPlugin from config files..."
for file in vue.config.js webpack.config.js; do
  if [ -f "$file" ]; then
    sed -i '/VuetifyLoaderPlugin/d' "$file"
    sed -i '/vuetify-loader/d' "$file"
  fi
done

# 6. Remove leftover styles or component references (optional grep notice)
echo "🔍 You may still have Vuetify components in use. Run this to find them:"
echo "    grep -r '<v-' src/"

# 7. Remove node_modules and reinstall
echo "🗑️ Removing node_modules and lock files..."
rm -rf node_modules package-lock.json yarn.lock

echo "🔁 Reinstalling clean dependencies..."
yarn install || npm install

echo "✅ Vuetify has been removed. You can now run 'yarn serve' or 'npm run serve'."
