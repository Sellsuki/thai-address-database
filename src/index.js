(function (angular) {
  'use strict'
  const utilAddress = require('./util/splitAddress')
  /**
 * From jquery.Thailand.js line 38 - 100
 */
  const preprocess = function (data) {
    let lookup = []
    let words = []
    const expanded = []
    let useLookup = false
    let t

    if (data.lookup && data.words) {
    // compact with dictionary and lookup
      useLookup = true
      lookup = data.lookup.split('|')
      words = data.words.split('|')
      data = data.data
    }

    t = function (text) {
      function repl (m) {
        const ch = m.charCodeAt(0)
        return words[ch < 97 ? ch - 65 : 26 + ch - 97]
      }
      if (!useLookup) {
        return text
      }
      if (typeof text === 'number') {
        text = lookup[text]
      }
      return text.replace(/[A-Z]/ig, repl)
    }

    if (!data[0].length) {
    // non-compacted database
      return data
    }
    // decompacted database in hierarchical form of:
    // [["province",[["amphur",[["district",["zip"...]]...]]...]]...]
    data.map(function (provinces) {
      let i = 1
      if (provinces.length === 3) { // geographic database
        i = 2
      }

      provinces[i].map(function (amphoes) {
        amphoes[i].map(function (districts) {
          districts[i] = districts[i] instanceof Array ? districts[i] : [districts[i]]
          districts[i].map(function (zipcode) {
            const entry = {
              district: t(districts[0]),
              amphoe: t(amphoes[0]),
              province: t(provinces[0]),
              zipcode
            }
            if (i === 2) { // geographic database
              entry.district_code = districts[1] || false
              entry.amphoe_code = amphoes[1] || false
              entry.province_code = provinces[1] || false
            }
            expanded.push(entry)
          })
        })
      })
    })
    return expanded
  }

  const db = preprocess(require('../database/db.json'))

  const resolveResultbyField = (type, searchStr, maxResult) => {
    searchStr = searchStr.toString().trim()
    if (searchStr === '') {
      return []
    }
    if (!maxResult) {
      maxResult = 20
    }
    let possibles = []
    try {
      possibles = db.filter(item => {
        const regex = new RegExp(searchStr, 'g')
        return (item[type] || '').toString().match(regex)
      }).slice(0, maxResult)
    } catch (e) {
      return []
    }
    return possibles
  }

  const searchAddressByDistrict = (searchStr, maxResult) => {
    return resolveResultbyField('district', searchStr, maxResult)
  }
  const searchAddressByAmphoe = (searchStr, maxResult) => {
    return resolveResultbyField('amphoe', searchStr, maxResult)
  }
  const searchAddressByProvince = (searchStr, maxResult) => {
    return resolveResultbyField('province', searchStr, maxResult)
  }
  const searchAddressByZipcode = (searchStr, maxResult) => {
    return resolveResultbyField('zipcode', searchStr, maxResult)
  }

  const splitAddress = (fullAddress) => {
    const regex = /\s(\d{5})(\s|$)/gi
    const regexResult = regex.exec(fullAddress)
    if (!regexResult) {
      return null
    }
    const zip = regexResult[1]
    const address = utilAddress.prepareAddress(fullAddress, zip)
    const result = utilAddress.getBestResult(zip, address)
    if (result) {
      const newAddress = utilAddress.cleanupAddress(address, result)
      return {
        address: newAddress,
        district: result.district,
        amphoe: result.amphoe,
        province: result.province,
        zipcode: zip
      }
    }
    return null
  }

  exports.searchAddressByDistrict = searchAddressByDistrict
  exports.searchAddressByAmphoe = searchAddressByAmphoe
  exports.searchAddressByProvince = searchAddressByProvince
  exports.searchAddressByZipcode = searchAddressByZipcode
  exports.splitAddress = splitAddress

  if (angular) {
    angular.module('thAddress', [])
      .config(function ($provide) {
        $provide.value('thad', {
          searchAddressByDistrict,
          searchAddressByAmphoe,
          searchAddressByProvince,
          searchAddressByZipcode,
          splitAddress
        })
      })
  }
})(typeof angular !== 'undefined' ? angular : false)
