#!/usr/bin/env node

"use strict"

const path = require("path")
const fs = require("fs")
const minimist = require("minimist")
const Transform = require("stream").Transform
// const getStdin = require("get-stdin")
const util = require("util")
const zlib = require("zlib")

let args = minimist(process.argv.slice(2), {
  boolean: ["help", "in", "out", "compress", "uncompress"],
  string: ["file"],
})

const BASE_PATH = process.env.BASE_PATH || __dirname
let OUTFILE = path.join(BASE_PATH, "out.txt")

if (args.help) {
  printHelp()
} else if (args.in || args._.includes("-")) {
  processFile(process.stdin)
} else if (args.file) {
  let stream = fs.createReadStream(path.join(BASE_PATH, args.file))
  processFile(stream)
} else {
  error("Incorrect Usage.", true)
}

// ***************

function processFile(inStream) {
  let outStream = inStream

  if (args.uncompress) {
    let gunzipStream = zlib.createGunzip()
    outStream = outStream.pipe(gunzipStream)
  }
  
  let upStream = new Transform({
    transform(chunk, enc, cb) {
      this.push(chunk.toString().toUpperCase())
      cb()
    },
  })

  outStream = outStream.pipe(upStream)

  if (args.compress) {
    let gzipStream = zlib.createGzip()
    outStream = outStream.pipe(gzipStream)
    OUTFILE = `${OUTFILE}.gz`
  }

  let targetStream
  if (args.out) {
    targetStream = process.stdout
  } else {
    targetStream = fs.createWriteStream(OUTFILE)
  }
  outStream.pipe(targetStream)
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
  console.log("--out                 print to stdout")
  console.log("--compress            gzip the output")
  console.log("--uncompress          un-gzip the input")
  console.log("")
}
