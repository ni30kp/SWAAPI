const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../index');

const { expect } = chai;
chai.use(chaiHttp);

describe('SWAPI Caching Server', () => {
  let tempVariable = true; // Initialize tempVariable to true

  it('should return data from the test endpoint', async () => {
    const res = await chai.request(app).get('/test');
    expect(res.status).to.equal(200);
    expect(res.body).to.eql({ message: 'Hello, this is a test endpoint!' });
  });

  it('should test other endpoints', async () => {
    // List of endpoints to test
    const endpointsToTest = ['/api/people', '/api/films', '/api/planets', /* add more endpoints */];

    for (const endpoint of endpointsToTest) {
      const res = await chai.request(app).get(endpoint);
      // Check if the status is 200, if not, set tempVariable to false
      if (res.status !== 200) {
        tempVariable = false;
      }
    }
  });

  after(() => {
    // Display the result of the temporary variable after all tests
    console.log(`All endpoints status: ${tempVariable ? 'OK' : 'Not OK'}`);
  });
});
