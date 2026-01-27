#!/bin/bash

# Create files for a Next.js tick logging project
mkdir -p pages/api prisma components pages
touch pages/api/ticks.js
touch prisma/schema.prisma
touch components/TickFilter.js
touch pages/ticks.js

echo "Files created successfully:"
echo "  - pages/api/ticks.js"
echo "  - prisma/schema.prisma"
echo "  - components/TickFilter.js"
echo "  - pages/ticks.js"
