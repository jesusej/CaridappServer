let chai = require('chai');
let chaiHttp = require('chai-http');
let expect = require('chai').expect;
chai.use(chaiHttp);
let url= 'https://caridapp.herokuapp.com';

describe('Inserts Donation', () => {
  it('Inserts Donation into DB', (done) => {
    chai.request(url)
    .post('/setDonation')
    .send({
      lineArray: [{
        upc: 750105530007,
        expirationDate: "2021-10-13",
        quantity: 5,
        unitaryCost: 50.5,
        originalQuantity: 6
      }]
    }). end( (err, res) => {
      console.log(res.body);
      expect(res).to.have.status(200);
      done();
    } )
  })
})