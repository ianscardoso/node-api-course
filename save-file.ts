import * as fs from 'fs' //const fs = require('fs'); => EcmaScript 5?
import * as yargs from 'yargs'

const argv = yargs//require('yargs')
            .alias('f', 'filename')
            .alias('c', 'content')
            .demandOption('filename')
            .demandOption('content')
            // .string('filename')
            // .string('content')
            .argv

fs.writeFile(String(argv.filename), String(argv.content), (error) => {
    if (error)
        throw error;

    console.log(`Arquivo ${argv.filename} foi salvo com sucesso.`)
})