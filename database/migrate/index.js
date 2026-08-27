'use strict';
const fs = require('fs')
const excelToJson = require('convert-excel-to-json');

console.log('Converting excel to JSON...')
const result = excelToJson({
    sourceFile: './database/raw_database/database.xlsx',
    header:{
        rows: 1
    },
    columnToKey: {
      A: 'province',
      B: 'amphoe',
      C: 'district',
      D: 'zipcode'
    }
})

console.log('Converting ---- done !')

/*
  A few tambon names in the master data arrive with a "ต." label glued to the
  front (e.g. "ต.ผาทอง" in อ.ท่าวังผา น่าน, "ต.หนองบัว" in อ.รัษฎา ตรัง). The
  label is not part of the name, and it stops a customer who types the real
  name from finding their tambon at all.

  Strip that prefix here rather than in the raw workbook, so the raw file keeps
  matching the master data drop we were given while the generated db.json stays
  searchable. The remainder must contain no further dot, which leaves genuine
  names like "จ.ป.ร." (อ.กระบุรี ระนอง) untouched.
*/
let relabeled = 0
result.Sheet1.forEach((row) => {
  if (typeof row.district !== 'string') {
    return
  }
  const stripped = row.district.replace(/^ต\.(?=[^.]+$)/, '').trim()
  if (stripped && stripped !== row.district) {
    console.log('Tambon label stripped: ' + row.district + ' -> ' + stripped)
    row.district = stripped
    relabeled++
  }
})
console.log('Tambon names relabeled ---- ' + relabeled)

fs.writeFile('./database/migrate/database.json', JSON.stringify(result.Sheet1), 'utf8', function (err) {
  if (err) {
    console.log('error')
    console.log(err)
    return
  }
  
  let exec = require('child_process').exec
  exec('node ./database/migrate/buildTree.js', function (err, stdout, stderr) {
    if (err) {
      console.log(err)
      return
    }
    console.log('Build json tree ---- done !')
    exec('node ./database/migrate/convert.js', function (err, stdout, stderr) {
      if (err) {
        console.log(err)
        return
      }
      
      fs.unlinkSync('./database/migrate/tree.json')
      fs.unlinkSync('./database/migrate/database.json')
      console.log('Minify tree ---- done !')
      console.log('All task completed and ready to go !!')
    })
  })
})

