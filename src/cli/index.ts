import ora from "ora";
import yargs from "yargs";
import { error, success } from "./utils";

async function cli() {
  // TODO: define several arguments to add more optional configurations
  const args = yargs.options({
    _: { type: "string", demandOption: true, alias: "f" },
  }).argv;

  // TODO: valite file extension - support for modules?
  const [file] = args._;
  if (!file) {
    error("you must provide a file");
    process.exit(1);
  }

  const spinner = ora(`Compiling file: ${file}`).start();
  // TODO: use compiler
  const promise = new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 2000);
  });
  await promise;
  spinner.stop();

  success(`successfully compiled!`);
  process.exit(0);
}

cli();
