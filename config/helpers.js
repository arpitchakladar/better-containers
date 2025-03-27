import path from "path";
import fs from "fs";

export const production = process.env.NODE_ENV === "production";
export let moduleMap = {};

export function writeFileRecursive(filePath, data) {
	fs.mkdirSync(path.dirname(filePath), { recursive: true });
	fs.appendFileSync(filePath, data, "utf8");
}
