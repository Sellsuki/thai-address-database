const utilAddress = require('../util/splitAddress')

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

exports.splitAddress = splitAddress
