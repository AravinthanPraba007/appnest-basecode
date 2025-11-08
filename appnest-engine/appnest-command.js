#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Folders setup
const projects = {
  'appnest-backend': path.join(__dirname, './appnest-backend'),
  'frontend-app': path.join(__dirname, './../frontend-app'),
  'backend-app': path.join(__dirname, './../backend-app'),
};

// Helper: Run a command safely
function runCommand(command, options = {}) {
  try {
    const output = execSync(command, { stdio: 'pipe', ...options });
    return output.toString().trim();
  } catch (error) {
    return null;
  }
}

// --- ACTION 1: Precheck ---
function precheck() {
  console.log('🔍 Running system precheck...\n');

  // Check Node.js version
  const nodeVersion = runCommand('node -v');
  if (!nodeVersion) {
    console.log('❌ Node.js is not installed.');
  } else {
    const majorVersion = parseInt(nodeVersion.replace('v', '').split('.')[0]);
    if (majorVersion >= 22) {
      console.log(`✅ Node.js ${nodeVersion} is installed.`);
    } else {
      console.log(
        `⚠️ Node.js ${nodeVersion} detected. Please upgrade to version 22 or higher.`
      );
    }
  }

  // Check ngrok
  const ngrokVersion = runCommand('ngrok version');
  if (ngrokVersion) {
    console.log(`✅ ngrok is installed (${ngrokVersion}).`);
  } else {
    console.log(
      '❌ ngrok not found. Please install it globally using "npm install -g ngrok".'
    );
  }

  console.log('\n✅ Precheck completed.\n');
}

// --- ACTION 2: Install Packages ---
function installPackages() {
  console.log('📦 Installing npm packages for all projects...\n');
  try {
    const projectsToInstall = {
      'appnest-backend': projects['appnest-backend'],
      'frontend-app': projects['frontend-app'],
      'backend-app': projects['backend-app'],
    };
    for (const [key, project] of Object.entries(projectsToInstall)) {
      if (fs.existsSync(path.join(project, 'package.json'))) {
        console.log(`➡️ Installing dependencies in: ${key} (${project})`);
        try {
          execSync('npm install', { cwd: project, stdio: 'inherit' });
        } catch (err) {
          console.error(
            `❌ Failed to install dependencies in: ${key} (${project})`
          );
          throw new Error(
            `❌ Failed to install dependencies in: ${key} (${project})`
          );
        }
      } else {
        console.warn(`⚠️ No package.json found in: ${key} (${project})`);
        throw new Error('Missing package.json in: ${key} (${project})');
      }
      console.log(
        `✅ All package installations completed in: ${key} (${project})`
      );
    }
    console.log('\n✅ All package installations completed.\n');
  } catch (error) {
    console.error('\n❌ Package installation process encountered errors.\n');
    process.exit(1);
  }
}

// --- ACTION 3: Run All Projects ---
function runAllProjects() {
  console.log('🚀 Starting all projects...\n');
  const projectProcesses = {};
  try {
    const projectsToRun = {
      'appnest-backend': projects['appnest-backend'],
      'frontend-app': projects['frontend-app'],
    };
    for (const [key, project] of Object.entries(projectsToRun)) {
      console.log(`➡️ Starting project: ${key}`);
      if (fs.existsSync(path.join(project, 'package.json'))) {
        console.log(`➡️ Running "npm run dev" in ${key} - ${project}`);
        const proc = spawn('npm', ['run', 'dev'], {
          cwd: project,
          stdio: 'inherit',
          shell: true,
        });
        proc.on('close', (code) => {
          console.log(`🛑 ${key} - ${project} exited with code ${code}`);
        });
        projectProcesses[key] = proc;
      } else {
        console.warn(`⚠️ No package.json found in ${key} - ${project}`);
        throw new Error('Missing package.json in: ${key} (${project})');
      }
    }
    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down...');
      if (projectProcesses) {
        for (const [key, proc] of Object.entries(projectProcesses)) {
          console.log(`🛑 Stopping: ${key}`);
          proc.kill('SIGINT');
        }
      }
      process.exit();
    });
  } catch (error) {
    console.error('\n❌ Error starting projects.\n');
    process.exit(1);
  }
}

// --- CLI Controller ---
const action = process.argv[2];

switch (action) {
  case 'precheck':
    precheck();
    break;
  case 'install-packages':
    installPackages();
    break;
  case 'run-all':
    runAllProjects();
    break;
  default:
    console.log(`
Usage: node terminalActions.js <action>

Available actions:
  precheck           Check Node.js (>=22) and ngrok installation
  install-packages   Install npm packages for both projects
  run-all            Run "npm run dev" in both projects
`);
}
