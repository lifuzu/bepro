const supertest = require('supertest');

const api = supertest('http://localhost:8086');

describe('Influxdb', () => {
  beforeEach(() => {
    api.post('/query')
      .set('Accept', 'application/x-www-form-urlencoded')
      .send('q=CREATE DATABASE "test_mydb"')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        expect(JSON.parse(res.text)).toMatchObject({ results: [{ statement_id: 0 }] });
      });
  });
  afterEach(() => {
    api.post('/query')
      .set('Accept', 'application/x-www-form-urlencoded')
      .send('q=DROP DATABASE "test_mydb"')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        expect(JSON.parse(res.text)).toMatchObject({ results: [{ statement_id: 0 }] });
      });
  });

  it('should ping db', () => {
    api.get('/ping')
      .expect('Content-Type', /json/)
      .expect('X-Influxdb-Version', '1.4.3')
      .expect(204)
      .end((err, res) => {
        expect(err).toBe(null);
        expect(res.text).toBe('');
      });
  });

  it('TODO: write data to db', () => {});
  it('TOTO: query data from db', () => {});
});
