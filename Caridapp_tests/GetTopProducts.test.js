let request = require("request");
let expect = require("chai").expect;
let baseUrl = "https://caridapp.herokuapp.com/getTopProducts";

describe('Get Top Products', () => {
  it('Gets the top 5 products used on donations', (done) => {
    request.get({ url: baseUrl }, 
      (error, response, body) => {
        console.log(body);
        let bodyObj = JSON.parse(body);
        let product = bodyObj[0];
        expect(product.upc);
        expect(product.itemName);
        expect(product.description);
        expect(product.unitaryWeight);
        done();
      })
  })
})