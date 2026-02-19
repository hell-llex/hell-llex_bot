import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const pkg = require("../../package.json");

export const APP_VERSION =
    process.env.BOT_VERSION ||
    process.env.npm_package_version ||
    pkg.version ||
    "0.0.0";
