(function (angular) {
  'use strict'
  const utilAddress = require('./util/splitAddress')
  const { preprocess } = require('./preprocess')
  const { AddressRepository } = require('./AddressRepository')

  const db = preprocess(require('../database/db.json'))

  const addressRepository = new AddressRepository(db)

  const splitAddress = (fullAddress) => {
    let regex = /\s(\d{5})(\s|$)/gi
    let regexResult = regex.exec(fullAddress)
    if (!regexResult) {
      return null
    }
    let zip = regexResult[1]
    let address = utilAddress.prepareAddress(fullAddress, zip)
    let result = utilAddress.getBestResult(zip, address)
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

  exports.searchAddressByDistrict = addressRepository.searchByDistrict
  exports.searchAddressByAmphoe = addressRepository.searchByAmphoe
  exports.searchAddressByProvince = addressRepository.searchByProvince
  exports.searchAddressByZipcode = addressRepository.searchByZipcode
  exports.splitAddress = splitAddress

  if (angular) {
    angular.module('thAddress', [])
    .config(function ($provide) {
      $provide.value('thad', {
        searchAddressByDistrict: addressRepository.searchByDistrict,
        searchAddressByAmphoe: addressRepository.searchByAmphoe,
        searchAddressByProvince: addressRepository.searchByProvince,
        searchAddressByZipcode: addressRepository.searchByZipcode,
        splitAddress: splitAddress
      })
    })
  }
})(typeof angular !== 'undefined' ? angular : false)
