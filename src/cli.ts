#!/usr/bin/env node

// CLI for Piper Language

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { Lexer } from './lexer.js';
import { Parser } from './parser.js';
import { CodeGenerator } from './codegen.js';
import { PiperError, formatError } from './errors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function compile(sourceCode: string): string {
  const lexer = new Lexer(sourceCode);
  const tokens = lexer.tokenize();

  const parser = new Parser(tokens, sourceCode);
  const ast = parser.parse();

  const codegen = new CodeGenerator();
  const jsCode = codegen.generate(ast);

  return jsCode;
}

function runCommand(args: string[]): void {
  if (args.length === 0) {
    console.error('Usage: piper <command> [options]');
    console.error('');
    console.error('Commands:');
    console.error('  run <file>     Compile and run a Piper file');
    console.error('  build <file>   Compile a Piper file to JavaScript');
    console.error('  help           Show this help message');
    process.exit(1);
  }

  const command = args[0];

  if (command === 'help' || command === '--help' || command === '-h') {
    console.log('Piper - A pipe-first programming language');
    console.log('');
    console.log('Usage: piper <command> [options]');
    console.log('');
    console.log('Commands:');
    console.log('  run <file>     Compile and run a Piper file');
    console.log('  build <file>   Compile a Piper file to JavaScript');
    console.log('  help           Show this help message');
    return;
  }

  if (command === 'run') {
    if (args.length < 2) {
      console.error('Error: No input file specified');
      console.error('Usage: piper run <file>');
      process.exit(1);
    }

    const inputFile = args[1];
    const absolutePath = path.resolve(inputFile);

    if (!fs.existsSync(absolutePath)) {
      console.error(`Error: File not found: ${inputFile}`);
      process.exit(1);
    }

    try {
      const sourceCode = fs.readFileSync(absolutePath, 'utf-8');
      const jsCode = compile(sourceCode);

      // Write to temp file
      const outputFile = absolutePath.replace(/\.piper$/, '.piper.js');
      fs.writeFileSync(outputFile, jsCode);

      // Copy runtime to same directory
      const runtimeSrc = path.join(__dirname, 'runtime.js');
      const runtimeDest = path.join(path.dirname(outputFile), 'runtime.js');

      if (fs.existsSync(runtimeSrc)) {
        fs.copyFileSync(runtimeSrc, runtimeDest);
      } else {
        // Runtime might be in src/ during development
        const runtimeDevSrc = path.join(__dirname, '..', 'src', 'runtime.ts');
        if (fs.existsSync(runtimeDevSrc)) {
          // For development, we need to compile runtime.ts first
          console.warn('Warning: Running in development mode');
        }
      }

      // Run the generated JavaScript
      const nodeProcess = spawn('node', [outputFile], {
        stdio: 'inherit',
        shell: true,
      });

      nodeProcess.on('exit', (code) => {
        // Clean up temp files
        try {
          fs.unlinkSync(outputFile);
          if (fs.existsSync(runtimeDest)) {
            fs.unlinkSync(runtimeDest);
          }
        } catch (e) {
          // Ignore cleanup errors
        }
        process.exit(code || 0);
      });
    } catch (error) {
      if (error instanceof PiperError) {
        error.filePath = inputFile;
        console.error(formatError(error));
      } else if (error instanceof Error) {
        console.error(`Error: ${error.message}`);
      } else {
        console.error('An unknown error occurred');
      }
      process.exit(1);
    }
    return;
  }

  if (command === 'build') {
    if (args.length < 2) {
      console.error('Error: No input file specified');
      console.error('Usage: piper build <file>');
      process.exit(1);
    }

    const inputFile = args[1];
    const absolutePath = path.resolve(inputFile);

    if (!fs.existsSync(absolutePath)) {
      console.error(`Error: File not found: ${inputFile}`);
      process.exit(1);
    }

    try {
      const sourceCode = fs.readFileSync(absolutePath, 'utf-8');
      const jsCode = compile(sourceCode);

      const outputFile = absolutePath.replace(/\.piper$/, '.js');
      fs.writeFileSync(outputFile, jsCode);

      // Copy runtime to same directory
      const runtimeSrc = path.join(__dirname, 'runtime.js');
      const runtimeDest = path.join(path.dirname(outputFile), 'runtime.js');

      if (fs.existsSync(runtimeSrc)) {
        fs.copyFileSync(runtimeSrc, runtimeDest);
      }

      console.log(`Compiled ${inputFile} -> ${outputFile}`);
    } catch (error) {
      if (error instanceof PiperError) {
        error.filePath = inputFile;
        console.error(formatError(error));
      } else if (error instanceof Error) {
        console.error(`Error: ${error.message}`);
      } else {
        console.error('An unknown error occurred');
      }
      process.exit(1);
    }
    return;
  }

  console.error(`Error: Unknown command '${command}'`);
  console.error('Run "piper help" for usage information');
  process.exit(1);
}

runCommand(process.argv.slice(2));
