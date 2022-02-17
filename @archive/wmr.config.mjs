import { defineConfig } from "wmr";

// Full list of options: https://wmr.dev/docs/configuration
export default defineConfig({
  alias: {
    "@lib/*": "./@lib",
    "@apps/*": "./apps",
  },
});
