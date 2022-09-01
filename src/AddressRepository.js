class AddressRepository {
  database = null
  maxResult = 20

  constructor (database) {
    this.database = database

    this.resolveResultbyField = this.resolveResultbyField.bind(this)
    this.searchByDistrict = this.searchByDistrict.bind(this)
    this.searchByAmphoe = this.searchByAmphoe.bind(this)
    this.searchByProvince = this.searchByProvince.bind(this)
    this.searchByZipcode = this.searchByZipcode.bind(this)
  }

  resolveResultbyField (type, searchStr, maxResult) {
    searchStr = searchStr.toString().trim()

    if (searchStr === '') {
      return []
    }

    if (!maxResult) {
      maxResult = this.database
    }

    let possibles = []

    try {
      possibles = this.database
        .filter(item => (item[type] || '').toString().match(new RegExp(searchStr, 'g')))
        .slice(0, maxResult)
    } catch (e) {
      return []
    }

    return possibles
  }

  // get all province
  getAllProvince () {
    return [ ...this.database.map(item => item.province) ]
  }

  searchByDistrict (searchStr, maxResult) {
    return this.resolveResultbyField('district', searchStr, maxResult)
  }

  searchByAmphoe (searchStr, maxResult) {
    return this.resolveResultbyField('amphoe', searchStr, maxResult)
  }

  searchByProvince (searchStr, maxResult) {
    return this.resolveResultbyField('province', searchStr, maxResult)
  }

  searchByZipcode (searchStr, maxResult) {
    return this.resolveResultbyField('zipcode', searchStr, maxResult)
  }
}

exports.AddressRepository = AddressRepository
