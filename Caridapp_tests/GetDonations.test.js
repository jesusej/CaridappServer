let request = require("request");
let expect = require("chai").expect;
let baseUrl = "https://caridapp.herokuapp.com/getDonations";

describe('Get Donations', () => {
  it('Gets all the donations for driver', (done) => {
    request.get({ url: baseUrl }, 
      (error, response, body) => {
        console.log(body);
        let bodyObj = JSON.parse(body);
        let donation = bodyObj[0];
        expect(donation.donationID);
        expect(donation.nameD);
        expect(donation.deliveryAddress);
        done();
      })
  })
})