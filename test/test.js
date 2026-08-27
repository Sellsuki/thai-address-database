'use strict'

const mocha = require('mocha')
const describe = mocha.describe
const it = mocha.it
const expect = require('chai').expect
const db = require('../src/index.js')

// Updated for the new master data (thailand-province): these Prachuap Khiri Khan
// tambons now resolve to a single zipcode (77120) instead of [77120, 77160].
describe('Prachuap Khiri Khan single zipcode (updated master data)', function () {
  const tambons = ['ปราณบุรี', 'วังก์พง', 'หนองตาแต้ม', 'เขาจ้าว', 'สามร้อยยอด', 'เขาน้อย']
  tambons.forEach((name) => {
    it('District ' + name + ' resolves to 77120 in ประจวบคีรีขันธ์', function () {
      const result = db.searchAddressByDistrict(name)
        .filter((item) => item.province === 'ประจวบคีรีขันธ์')
      expect(result.length).to.equal(1)
      expect(Number(result[0].zipcode)).to.equal(77120)
    })
  })
})

// LIN-651 round 2: the master data QA rejected on 2026-07-24 has been corrected
// upstream. These lock in the eight defects so a future master data drop cannot
// reintroduce them.
describe('Master data defects corrected (LIN-651 QA round 2)', function () {
  const exact = (name) => db.searchAddressByDistrict(name, 100)
    .filter((item) => item.district === name)

  it('Tambon เวียงเหนือ in ลำปาง carries only its own name', function () {
    const result = exact('เวียงเหนือ').filter((item) => item.province === 'ลำปาง')
    expect(result.length).to.equal(1)
    expect(result[0].amphoe).to.equal('เมืองลำปาง')
    expect(Number(result[0].zipcode)).to.equal(52000)
  })

  it('Amphoe เวียงเก่า in ขอนแก่น is present with all three tambons', function () {
    const result = db.searchAddressByAmphoe('เวียงเก่า', 50)
    expect(result.length).to.equal(3)
    expect(result.map((item) => item.district).sort()).to.deep.equal(
      ['ในเมือง', 'เขาน้อย', 'เมืองเก่าพัฒนา'].sort()
    )
    result.forEach((item) => {
      expect(item.province).to.equal('ขอนแก่น')
      expect(Number(item.zipcode)).to.equal(40150)
    })
  })

  it('Tambon สุเทพ resolves to a single zipcode 50200', function () {
    const result = exact('สุเทพ')
    expect(result.length).to.equal(1)
    expect(Number(result[0].zipcode)).to.equal(50200)
  })

  it('เขตการปกครองพิเศษพัทยา is spelled correctly and present', function () {
    const result = exact('เขตการปกครองพิเศษพัทยา')
    expect(result.length).to.equal(1)
    expect(result[0].amphoe).to.equal('บางละมุง')
    expect(result[0].province).to.equal('ชลบุรี')
    expect(Number(result[0].zipcode)).to.equal(20150)
  })

  it('Previously duplicated tambons now appear once', function () {
    const cases = [
      ['ท้ายบ้านใหม่', 'เมืองสมุทรปราการ', 10280],
      ['นาข่า', 'เมืองอุดรธานี', 41000],
      ['หนองบัว', 'พยัคฆภูมิพิสัย', 44110],
      ['รัษฎา', 'เมืองภูเก็ต', 83000]
    ]
    cases.forEach(([name, amphoe, zipcode]) => {
      const result = exact(name).filter((item) => item.amphoe === amphoe)
      expect(result.length, name).to.equal(1)
      expect(Number(result[0].zipcode), name).to.equal(zipcode)
    })
  })

  it('Tambon names arriving with a "ต." label are searchable by their real name', function () {
    const phathong = exact('ผาทอง')
    expect(phathong.length).to.equal(1)
    expect(phathong[0].amphoe).to.equal('ท่าวังผา')
    expect(Number(phathong[0].zipcode)).to.equal(55140)

    const nongbua = exact('หนองบัว').filter((item) => item.amphoe === 'รัษฎา')
    expect(nongbua.length).to.equal(1)
    expect(Number(nongbua[0].zipcode)).to.equal(92160)

    expect(exact('ต.ผาทอง').length).to.equal(0)
    expect(exact('ต.หนองบัว').length).to.equal(0)
  })

  it('Genuine dotted name จ.ป.ร. is left alone', function () {
    const result = exact('จ.ป.ร.')
    expect(result.length).to.equal(1)
    expect(result[0].amphoe).to.equal('กระบุรี')
    expect(result[0].province).to.equal('ระนอง')
  })

  it('Bangkok khwaeng splits are in place', function () {
    const bangna = db.searchAddressByAmphoe('บางนา', 50)
      .filter((item) => item.province === 'กรุงเทพมหานคร')
      .map((item) => item.district)
    expect(bangna.sort()).to.deep.equal(['บางนาเหนือ', 'บางนาใต้'].sort())

    const bangbon = db.searchAddressByAmphoe('บางบอน', 50)
      .filter((item) => item.province === 'กรุงเทพมหานคร')
      .map((item) => item.district)
    expect(bangbon.length).to.equal(4)
  })
})

describe('#search', function () {
  it('searchAddressByDistrict', function () {
    let result = db.searchAddressByDistrict('อรัญประเทศ')
    expect(result.length).to.equal(1)

    result = db.searchAddressByDistrict(' อรัญประเทศ')
    expect(result.length).to.equal(1)

    result = db.searchAddressByDistrict('อรัญประเทศ ')
    expect(result.length).to.equal(1)

    result = db.searchAddressByDistrict('  อรัญประเทศ  ')
    expect(result.length).to.equal(1)

    result = db.searchAddressByDistrict('')
    expect(result.length).to.equal(0)

    result = db.searchAddressByDistrict('  ')
    expect(result.length).to.equal(0)
  })

  it('searchAddressByAmphoe', function () {
    let result = db.searchAddressByAmphoe('อรัญประเทศ')
    expect(result.length).to.equal(13)

    result = db.searchAddressByAmphoe('')
    expect(result.length).to.equal(0)
  })

  it('searchAddressByProvince', function () {
    let result = db.searchAddressByProvince('สระแก้ว')
    expect(result.length).to.equal(20)

    result = db.searchAddressByProvince('สระแก้ว', 10)
    expect(result.length).to.equal(10)

    result = db.searchAddressByProvince('อรัญประเทศ')
    expect(result.length).to.equal(0)

    result = db.searchAddressByProvince('')
    expect(result.length).to.equal(0)
  })

  it('searchAddressByZipcode', function () {
    let result = db.searchAddressByZipcode('27120')
    expect(result.length).to.equal(15)

    result = db.searchAddressByZipcode(27120)
    expect(result.length).to.equal(15)

    result = db.searchAddressByZipcode(27120, 5)
    expect(result.length).to.equal(5)

    result = db.searchAddressByZipcode('')
    expect(result.length).to.equal(0)
  })
})

describe('Function splitAddress', function () {
  it('Shoud split address without touching original address', function () {
    const addr = '126/548 ถ.สุขาประชาสรรค์ ม.การเคหะนนท์ ปากเกร็ด ปากเกร็ด นนทบุรี Thailand 11120'
    const result = db.splitAddress(addr)
    expect(result).to.deep.equal({
      'address': '126/548 ถ.สุขาประชาสรรค์ ม.การเคหะนนท์',
      'amphoe': 'ปากเกร็ด',
      'district': 'ปากเกร็ด',
      'province': 'นนทบุรี',
      'zipcode': '11120'
    })

    expect(addr).to.equal('126/548 ถ.สุขาประชาสรรค์ ม.การเคหะนนท์ ปากเกร็ด ปากเกร็ด นนทบุรี Thailand 11120')
  })

  it('Shoud return null when cant split address', function () {
    const addr = '126/548 ถ.สุขาประชาสรรค์ ม.การเคหะนนท์'
    const result = db.splitAddress(addr)
    expect(result).to.be.null

    expect(addr).to.equal('126/548 ถ.สุขาประชาสรรค์ ม.การเคหะนนท์')
  })

  it('Shoud return null when cant split address', function () {
    const addr = '126/548 ถ.สุขาประชาสรรค์ ม.การเคหะนนท์ ปากเกร็ด ปากเกร็ด Thailand 11120'
    const result = db.splitAddress(addr)
    expect(result).to.be.null

    expect(addr).to.equal('126/548 ถ.สุขาประชาสรรค์ ม.การเคหะนนท์ ปากเกร็ด ปากเกร็ด Thailand 11120')
  })

  it('Shoud return null when cant split address', function () {
    const addr = '126/548 ถ.สุขาประชาสรรค์ ม.การเคหะนนท์ Thailand 11120'
    const result = db.splitAddress(addr)
    console.log(result)
    expect(result).to.be.null

    expect(addr).to.equal('126/548 ถ.สุขาประชาสรรค์ ม.การเคหะนนท์ Thailand 11120')
  })
})
