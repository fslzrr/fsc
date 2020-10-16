import ora from "ora";
import yargs from "yargs";

async function init() {
  // TODO: define several arguments to add more optional configurations
  const args = yargs.options({
    _: { type: "string", demandOption: true, alias: "f" },
  }).argv;

  // TODO: valite file extension - support for modules?
  const [file] = args._;
  if (!file) {
    console.error("You must provide a file.");
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

  console.log(`Successfully compiled!`);
  process.exit(0);
}

init();
