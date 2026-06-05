import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const pkg = require("../../package.json");

export const APP_VERSION =
    pkg.version ||
    process.env.BOT_VERSION ||
    process.env.npm_package_version ||
    "0.0.0";
