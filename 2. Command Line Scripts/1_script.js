#!/usr/bin/env node

"use strict"

const path = require("path")
const fs = require("fs")
const minimist = require("minimist")
const getStdin = require("get-stdin")
const util = require("util")

let args = minimist(process.argv.slice(2), {
  boolean: ["help", "in"],
  string: ["file"],
})

const BASE_PATH = process.env.BASE_PATH || __dirname

if (args.help) {
  printHelp()
} else if (args.in || args._.includes("-")) {
  getStdin().then(processFile).catch(error)
} else if (args.file) {
  fs.readFile(path.join(BASE_PATH, args.file), (err, contents) => {
    if (err) {
      error(err.toString())
    } else {
      processFile(contents)
    }
  })
} else {
  error("Incorrect Usage.", true)
}
// printHelp()

// ***************

function processFile(contents) {
  contents = contents.toString().toUpperCase()
  process.stdout.write(contents)
}
function error(msg, includeHelp = false) {
  console.log(msg)
  if (includeHelp) {
    console.log("")
    printHelp()
  }
}
function printHelp() {
  console.log("script usage:")
  console.log(" script.js --file={FILENAME}")
  console.log("")
  console.log("--help                print this help")
  console.log("--file={FILENAME}     process the file")
  console.log("--in, -               process stdin")
  console.log("")
}
