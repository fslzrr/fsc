import { bold, green, red } from "chalk";

const log = console.log;

const error = (text: string) => log(`${bold(red("ERROR"))} ${text}`);
const success = (text: string) => log(`${bold(green("SUCCESS"))} ${text}`);

export { error, success };
