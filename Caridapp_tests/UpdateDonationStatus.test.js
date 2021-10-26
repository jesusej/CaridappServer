let chai = require('chai');
let chaiHttp = require('chai-http');
let expect = require('chai').expect;
chai.use(chaiHttp);
let url= 'https://caridapp.herokuapp.com';

describe('Update Donation Status', () => {
  it('Updates Donation Status into DB with ID', (done) => {
    chai.request(url)
    .put('/updateDonationStatus')
    .send({
      donationID: 15
    }). end( (err, res) => {
      console.log(res.body);
      expect(res).to.have.status(200);
      done();
    } )
  })
})