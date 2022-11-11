import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import PromiseMap from './PromiseMap.js'

chai.use(chaiAsPromised)

const { expect } = chai

describe('PromiseMap', () => {
  const promiseMap = new PromiseMap()
  it('should create a new promise', () => {
    const promise = promiseMap.create('test')
    expect(promise).to.be.an.instanceof(Promise)
  })

  it('should test if the promise exists', () => {
    expect(promiseMap.has('test')).to.be.true
  })
  
  it('should resolve that promise', (done) => {
    expect(promiseMap.get('test')).to.eventually.be.equal('Oh! Hi, Mark!').and.notify(done)
    expect(promiseMap.resolve('test', 'Oh! Hi, Mark!')).to.be.undefined
  })

  it('should throw if we try to resolve the promise again', () => {
    expect(() => promiseMap.resolve('test', 'Hello'))
      .to.throw('Promise "test" doesn\'t exists')
  })
  
  it('should throw if we try to reject the promise again', () => {
    expect(() => promiseMap.reject('test', 'Hello'))
      .to.throw('Promise "test" doesn\'t exists')
  })

  it('should create a new promise (with a time out)', async () => {
    const promise = promiseMap.create('test-timed', 1000)
    promiseMap.resolve('test-timed', 'Oh! Hi, Mark!')
    await expect(promise).to.eventually.be.equal('Oh! Hi, Mark!')
  })

  it('should create a new promise that times out', async () => {
    const promise = promiseMap.create('test-timed', 100)
    await expect(promise).to.eventually.be.rejectedWith('Timed out')
  })

  it('should throw if we try to resolve the promise again', () => {
    expect(() => promiseMap.resolve('test-timed', 'Hello'))
      .to.throw('Promise "test-timed" doesn\'t exists')
  })
  
  it('should throw if we try to reject the promise again', () => {
    expect(() => promiseMap.reject('test-timed', 'Hello'))
      .to.throw('Promise "test-timed" doesn\'t exists')
  })

  it('should create a new promise and cancel it', () => {
    const promise = promiseMap.create('test-cancel')
    promiseMap.cancel('test-cancel')
  })

  it('should throw if we try to resolve the promise again', () => {
    expect(() => promiseMap.resolve('test-cancel', 'Hello'))
      .to.throw('Promise "test-cancel" doesn\'t exists')
  })
  
  it('should throw if we try to reject the promise again', () => {
    expect(() => promiseMap.reject('test-cancel', 'Hello'))
      .to.throw('Promise "test-cancel" doesn\'t exists')
  })

  it('should create multiple promises and cancel all', () => {
    for (let i = 0; i < 10; i++) {
      promiseMap.create('test' + i)
    }
    promiseMap.cancelAll()
    expect(promiseMap.size).to.be.equal(0)
  })

  it('should create multiple promises and resolve all', () => {
    for (let i = 0; i < 10; i++) {
      promiseMap.create('test' + i)
    }
    promiseMap.resolveAll('Oh! Hi, Mark!')
    expect(promiseMap.size).to.be.equal(0)
  })

  it('should create multiple promises and reject all', () => {
    for (let i = 0; i < 10; i++) {
      promiseMap.create('test' + i)
    }
    promiseMap.rejectAll(new Error('Meeck!'))
    expect(promiseMap.size).to.be.equal(0)
  })
})
