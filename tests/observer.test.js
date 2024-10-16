import { StatDict } from '../observer-monitor';
import { expect } from 'chai';

const coll = new Mongo.Collection('test')

describe('Observer', () => {
  let observer

  beforeEach(async () => {
    await coll.removeAsync({}, { multi: true })

    observer = await coll.find({}).observeChanges({
      added: (...args) => console.log('added', args),
      changed: (...args) => console.log('changed', args),
      removed: (...args) => console.log('removed', args),
    })
  });

  afterEach(async () => {
    observer.stop()
    await coll.removeAsync({}, { multi: true })
  });

  it('should detect observer creation', async () => {
    await coll.insertAsync({ foo: 'bar' })

    expect(StatDict.size).to.equal(1);
    expect(StatDict.get('test::{}')).to.have.property('key', 'test::{}');
  });
})