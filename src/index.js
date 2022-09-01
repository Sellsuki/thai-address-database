(function (angular) {
  'use strict'
  const { splitAddress } = require('./actions/splitAddress')
  const { preprocess } = require('./actions/preprocess')
  const { AddressRepository } = require('./AddressRepository')

  const db = preprocess(require('../database/db.json'))

  const addressRepository = new AddressRepository(db)

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
