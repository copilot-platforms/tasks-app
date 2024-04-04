#!/usr/bin/env node

const runCommand = (command) => {
  const { execSync } = require('child_process');

  try {
    execSync(command, { stdio: 'inherit' });
  } catch (e) {
    console.error(`Failed to execute the command ${command}`, e);

    return false;
  }

  return true;
};

const repositoryName = process.argv[2];
const command = `git clone --depth 1 git@github.com:pagevamp/copilot-custom-app-starter-kit.git ${repositoryName}`;
const installDependenciesCommand = `cd ${repositoryName} && yarn install`;

console.log(`Cloning repository ${repositoryName}...`);
const checkedOut = runCommand(command);

if (!checkedOut) {
  process.exit(-1);
}

console.log(`Installing dependencies...`);
const dependenciesInstalled = runCommand(installDependenciesCommand);

if (!dependenciesInstalled) {
  process.exit(-1);
}

console.log(`Successfully installed the application!`);
console.log(`To start the application, run the following commands:`);
console.log(`cd ${repositoryName} && yarn start`);
