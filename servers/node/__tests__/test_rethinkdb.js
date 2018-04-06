const r = require('rethinkdb');

describe('Rethinkdb', () => {
  let connection = null;
  beforeEach(async () => {
    connection = await r.connect({ host: 'localhost', port: 28015 });
    expect(connection).not.toBeNull();

    const result = await r.db('test').tableCreate('authors').run(connection);
    expect(result).not.toBeNull();
  });
  afterEach(async () => {
    const result = await r.db('test').tableDrop('authors').run(connection);
    expect(result).not.toBeNull();
  });

  it('should have table in rethinkdb', async () => {
    const tableList = await r.db('test').tableList().run(connection);
    expect(tableList).toEqual(expect.arrayContaining(['authors']));
  });

  it('should have change subscribed', async () => {
    const cursor = await r.db('test').table('authors').changes().run(connection);
    await r.db('test').table('authors').insert({ id: 1 }).run(connection);
    const change = await cursor.next();
    expect(change).toHaveProperty('new_val.id', 1);
  });

  it('TOTO: query data from db', () => {});
});
