#!/usr/bin/env node
import figlet from "figlet";
import chalkAnimation from "chalk-animation";
import inquirer from "inquirer";
import chalk from "chalk";
import simpleGit from "simple-git";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs/promises";
import { ESLint } from "eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const git = simpleGit();
const sourceDir = join(__dirname, "source");

// Clone repository safely
async function cloneRepo(repoUrl, destination) {
  try {
    try {
      await fs.access(destination);
      console.log(`Directory ${destination} exists. Removing...`);
      await fs.rm(destination, { recursive: true, force: true });
    } catch {
      // Directory doesn't exist; no action needed
    }

    console.log(`Cloning ${repoUrl} into ${destination}...`);
    await git.clone(repoUrl, destination);
    console.log("Repository cloned successfully!");

    await fs.access(destination);
    const dirContents = await fs.readdir(destination);
    console.log(`Cloned directory contents: ${dirContents.join(", ")}`);
  } catch (error) {
    console.error("Failed to clone repository:", error.message);
    throw new Error(`Cloning failed: ${error.message}`);
  }
}

// Sleep utility
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Banner display
async function banner() {
  return new Promise((resolve) => {
    figlet("Linting Tool", (err, data) => {
      if (err) {
        console.log("Error displaying banner:", err);
        resolve();
        return;
      }
      const rainbow = chalkAnimation.rainbow(data);
      setTimeout(() => {
        rainbow.stop();
        console.log(`${chalk.whiteBright(`Want Private Repos? Login Here \n`)}`);
        resolve();
      }, 1000);
    });
  });
}

// Prompt for repo URL
async function inputURL() {
  let response = await inquirer.prompt({
    type: "input",
    name: "URL",
    message: "Paste the URL of your GitHub repo: ",
  });
  return response.URL;
}

// Recursively read JavaScript files
async function readFiles(dir) {
  let files = [];
  try {
    const items = await fs.readdir(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = join(dir, item.name);
      if (item.isDirectory()) {
        files = files.concat(await readFiles(fullPath));
      } else if (item.name.endsWith(".js")) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
    throw error;
  }
  return files;
}

async function writeEslintIgnore(dir) {
  const ignoreContent = `
    node_modules
  `;
  const ignorePath = `${dir}/.eslintignore`;
  await fs.writeFile(ignorePath, ignoreContent.trim());
  console.log(`Wrote ESLint ignore file to ${ignorePath}`);
}


// Write ESLint Flat Config
async function writeEslintConfig(dir) {
  const configContent = `
    import js from "@eslint/js";

    export default [
      js.configs.recommended,
      {
        ignores: ["node_modules/"],
        languageOptions: {
          ecmaVersion: "latest",
          sourceType: "module",
          globals: {
            console: "readonly",
            process: "readonly",
            exports: "readonly:,
          },
        },
        rules: {
          "indent": ["error", 2],
          "quotes": ["error", "single"],
          "semi": ["error", "always"],
          "no-unused-vars": ["warn"],
          "no-console": "off"
        },
      },
    ];
  `;
  const configPath = join(dir, "eslint.config.js");
  await fs.writeFile(configPath, configContent.trim());
  console.log(`Wrote temporary ESLint config to ${configPath}`);
  return configPath;
}

// Lint JavaScript files
async function lintFiles(files) {
  await writeEslintConfig(sourceDir);
  const eslint = new ESLint({
    fix: true,
    cwd: sourceDir, // Ensures the correct working directory
  });

  console.log("Linting files:", files);
  try {
    const results = await eslint.lintFiles(files);
    await ESLint.outputFixes(results);

    results.forEach((result) => {
      if (result.errorCount > 0 || result.warningCount > 0) {
        console.log(chalk.yellow(`Issues in ${result.filePath}:`));
        result.messages.forEach((msg) => {
          console.log(`  ${msg.severity === 2 ? chalk.red(msg.message) : chalk.yellow(msg.message)}`);
        });
      } else {
        console.log(chalk.green(`${result.filePath} passed linting!`));
      }
    });
  } catch (error) {
    console.error("ESLint failed:", error.message);
    throw error;
  }
}

// Main execution
async function main() {
  await banner();
  await sleep(2000);

  const repoUrl = await inputURL();
  await cloneRepo(repoUrl, sourceDir);

  const files = await readFiles(sourceDir);
  if (files.length === 0) {
    console.log("No JavaScript files found to lint.");
    return;
  }
  await writeEslintIgnore(sourceDir);
  await lintFiles(files);
}

main().catch((error) => console.error("Main process failed:", error.message));
