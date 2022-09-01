class AddressRepository {
  constructor (db) {
    this.db = db

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
      maxResult = 20
    }
    let possibles = []
    try {
      possibles = this.db.filter(item => {
        let regex = new RegExp(searchStr, 'g')
        return (item[type] || '').toString().match(regex)
      }).slice(0, maxResult)
    } catch (e) {
      return []
    }
    return possibles
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
