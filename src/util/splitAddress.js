const lib = require('../index.js')

exports.prepareAddress = function (address, zip) {
  address = address.replace(zip, '')
  address = address.replace('Thailand', '')
  address = address.replace('ต.', '')
  address = address.replace('อ.', '')
  address = address.replace('จ.', '')
  address = address.replace('ตำบล', '')
  address = address.replace('อำเภอ', '')
  address = address.replace('จังหวัด', '')
  address = address.replace('แขวง', '')
  address = address.replace('เขต', '')
  address = address.replace('แขวง.', '')
  address = address.replace('เขต.', '')
  address = address.replace(' กทม. ', ' กรุงเทพมหานคร ')
  address = address.replace(' กทม ', ' กรุงเทพมหานคร ')
  address = address.replace(' กรุงเทพ ', ' กรุงเทพมหานคร ')
  return address
}

exports.getBestResult = function (zip, address) {
  const searchResult = lib.searchAddressByZipcode(zip)
  searchResult.forEach((element, index) => {
    const district = address.indexOf(element.district)
    let next = (district !== -1) ? district + 1 : 0
    const amphoe = address.indexOf(element.amphoe, next)
    next = (amphoe !== -1) ? amphoe + 1 : next + 1
    const province = address.indexOf(element.province, next)
    const point = [district, amphoe, province].filter(el => el >= 0).length
    searchResult[index].point = point
  })
  searchResult.sort((a, b) => b.point - a.point)
  if (searchResult && searchResult[0] && searchResult[0].point === 3) {
    return searchResult[0]
  } else {
    return null
  }
}

exports.cleanupAddress = function (address, result) {
  const regexDistrict = new RegExp(`\\s${result.district}`, 'g')
  const findDistrict = regexDistrict.exec(address)
  if (findDistrict) {
    address = address.replace(findDistrict[0], '')
  }
  const regexAmphoe = new RegExp(`\\s${result.amphoe}|เมือง`, 'g')
  const findAmphoe = regexAmphoe.exec(address)
  if (findAmphoe) {
    address = address.replace(findAmphoe[0], '')
  }
  const regexProvince = new RegExp(`\\s${result.province}`, 'g')
  const findProvince = regexProvince.exec(address)
  if (findProvince) {
    address = address.replace(findProvince[0], '')
  }
  address = address.trim()
  return address
}
