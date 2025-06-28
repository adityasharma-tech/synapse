"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KV = void 0;
const KV = {
    stringify(data) {
        const entries = Object.entries(data);
        const result = new Array(entries.length);
        for (let i = 0; i < entries.length; i++) {
            const [key, value] = entries[i];
            result[i] = `${key}=${
                typeof value == "string"
                    ? value.replace(/[=;]/g, (m) => (m === "=" ? "%3D" : "%3B"))
                    : value
            }`;
        }
        return result.join(";") + (result.length > 0 ? ";" : "");
    },
    jsonify(input) {
        const result = {};
        const pairs = input.split(";").filter(Boolean); // Remove empty strings from trailing semicolon
        for (const pair of pairs) {
            let [key, val] = pair.split("=");
            if (!key || val === undefined) continue;
            if (typeof val === "string")
                val = val.replace(/%3D|%3B/g, (m) => (m === "%3D" ? "=" : ";"));
            // Try to parse value into correct type
            if (val === "true") {
                result[key] = true;
            } else if (val === "false") {
                result[key] = false;
            } else if (!isNaN(Number(val))) {
                result[key] = Number(val);
            } else {
                result[key] = val;
            }
        }
        return result;
    },
};
exports.KV = KV;
