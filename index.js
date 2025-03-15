#!/usr/bin/env node
import figlet from "figlet";
import chalkAnimation from "chalk-animation";
import inquirer from "inquirer";
import chalk from "chalk";
import gh from "parse-github-url";
import fetch from "node-fetch";
import simpleGit from "simple-git";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const git = simpleGit();

async function cloneRepo(repoUrl, destination) {
  try {
    console.log(`Cloning ${repoUrl} into ${destination}...`);
    await git.clone(repoUrl, destination);
    console.log("Repository cloned successfully!");
  } catch (error) {
    console.error("Error cloning repository:", error);
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function banner() {
  figlet("Linting Tool", async function (err, data) {
    if (err) {
      console.log("Something went wrong...");
      console.dir(err);
      return;
    }
    const rainbow = chalkAnimation.rainbow(data);
    await sleep(1000);
    rainbow.stop();
    console.log(`${chalk.whiteBright(`Want Private Repos? Login Here \n`)}`);
  });
}

async function inputURL() {
  let response = await inquirer.prompt({
    type: "input",
    name: "URL",
    message: "Paste the URL of your github repo: ",
  });

  cloneRepo(response.URL, `${__dirname}/source`);
}

banner();
await sleep(2000);
inputURL();
