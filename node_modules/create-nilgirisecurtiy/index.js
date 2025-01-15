#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATE_PATH = path.join(__dirname, 'templates');

const copyTemplateFiles = (templatePath, destinationPath) => {
  if (!fs.existsSync(destinationPath)) {
    fs.mkdirSync(destinationPath, { recursive: true });
  }

  const items = fs.readdirSync(templatePath);
  items.forEach(item => {
    const source = path.join(templatePath, item);
    const destination = path.join(destinationPath, item);

    if (fs.statSync(source).isDirectory()) {
      copyTemplateFiles(source, destination);
    } else {
      fs.copyFileSync(source, destination);
    }
  });
};

const generateProject = () => {
  const projectName = process.argv[2] || 'nilgiriperformance';
  const projectPath = path.join(process.cwd(), projectName);

  if (fs.existsSync(projectPath)) {
    console.error(`Error: Directory "${projectName}" already exists.`);
    process.exit(1);
  }

  copyTemplateFiles(TEMPLATE_PATH, projectPath);
  console.log(`Project "${projectName}" created successfully.`);
  console.log(`\nNavigate to the project folder:\n  cd ${projectName}`);
  console.log(`\nInstall dependencies:\n  npm run dependencyInstall`);
  console.log(`\nTo Rum Perfromannce:\n  npm run performance`);
  
};

generateProject();