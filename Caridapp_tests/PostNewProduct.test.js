let chai = require('chai');
let chaiHttp = require('chai-http');
const expect = require('chai').expect;
chai.use(chaiHttp);
const url= 'https://caridapp.herokuapp.com';

describe('Insertar un nuevo producto: (Nota: Dado que es una PK, el upc debe cambiar con cada iteracion del test)',()=>{
    it('Debe insertar un producto', (done) => {
            chai.request(url)
            .post('/import')
            .send({upc:702, itemName: "Nieve de Almeja", description: "Sabor Sandia", unitaryWeight: 2.0})
            .end( function(err,res){
                console.log(res.body)
                expect(res).to.have.status(200);
                done();
            });
    });
});
