# PromiseMap

## What is a PromiseMap

A `PromiseMap` simplifies **a lot** working with asynchronous code with message oriented APIs like `WebWorker`s, `WebSocket`s, `ChildProcess`s, etc.

Basically, it keeps track of promises asigning it an identifier. This identifier can be anything: an object, a number, a string, etc. So we can send the identifier as part of a request message and then return that identifier in the response message.

Here is an example using a `WebWorker` with two files `index.js` and `worker.js`.

```javascript
// index.js
import { v4 as uuid } from 'uuid'
import PromiseMap from '@rojo2/promise-map'

function createPromisifiedWorker() {
  const promiseMap = new PromiseMap()
  const worker = new WebWorker('worker.js')
  worker.onmessage = (e) => {
    if (e.data.type === 'failure') {
      promiseMap.resolve(e.data.id, e.data.payload)
    } else if (e.data.type === 'success') {
      promiseMap.reject(e.data.id, new Error(e.data.payload))
    }
  }

  function request(type, payload) {
    const id = uuid()
    worker.postMessage({ id, type, payload })
    return promiseMap.create(id, 60000)
  }

  return {
    request
  }
}

const worker = createPromisifiedWorker()
// Now we can have a more async/await friendly API
// around WebWorkers.
await worker.request('dosomething', {
  ...payload...
})
```

```javascript
// worker.js
self.addEventListener('message', (e) => {
  self.postMessage({
    id: e.data.id,
    type: (Math.random() < 0.5) ? 'success' : 'failure',
    payload: 'Hey! Ho! Let\'s go'
  })
})
```

Made with :heart: by [rojo 2](https://github.com/rojo2)
