/**
 * @typedef {object} PromiseExecutor
 * @property {function} resolve
 * @property {function} reject
 * @property {NodeJS.Timeout|number|undefined} [timeout]
 */

/**
 * PromiseMap
 *
 * Keeps track of promises using a map of promises.
 */
export class PromiseMap {
  /**
   * Pending promises
   *
   * @type {Map<any, Promise>}
   */
  #promises = new Map()

  /**
   * Pending promise executors
   *
   * @type {Map<any, PromiseExecutor>}
   */
  #executors = new Map()

  /**
   * Amount of pending promises
   *
   * @type {number}
   */
  get size() {
    return this.#promises.size
  }

  /**
   * Creates a new promise and returns it
   *
   * @param {any} id Promise identifier
   * @param {number} [time=Infinity] Time to wait before rejecting promise
   * @returns {Promise<any>}
   */
  create(id, time = Infinity) {
    const promise = new Promise((resolve, reject) => {
      let timeout
      if (Number.isFinite(time) && time > 0) {
        timeout = setTimeout(
          () => {
            this.#executors.delete(id)
            this.#promises.delete(id)
            reject(new Error('Timed out'))
          },
          time
        )
      }
      this.#executors.set(id, { resolve, reject, timeout })
    })
    this.#promises.set(id, promise)
    return promise
  }

  /**
   * Retrieves the promise by it's identifier. This method
   * removes the promise.
   *
   * @param {any} id Promise identifier
   * @returns {Promise}
   */
  #retrieve(id) {
    if (!this.#executors.has(id)) {
      throw new Error(`Promise "${id}" doesn't exists`)
    }
    const promise = this.#executors.get(id)
    this.#executors.delete(id)
    this.#promises.delete(id)
    const { resolve, reject, timeout } = promise
    if (timeout !== undefined) {
      clearTimeout(timeout)
    }
    return { resolve, reject }
  }

  /**
   * Returns true if the promise identified by id
   * exists in the promise map.
   *
   * @param {any} id Promise identifier
   * @returns {boolean}
   */
  has(id) {
    return this.#promises.has(id)
  }

  /**
   * Returns the promise identified by the id.
   *
   * @param {any} id Promise identifier
   * @returns {Promise}
   */
  get(id) {
    return this.#promises.get(id)
  }

  /**
   * Cancels a promise.
   *
   * @param {any} id Promise identifier
   */
  cancel(id) {
    this.#retrieve(id)
  }

  /**
   * Resolves a promise by its identifier.
   *
   * @param {any} id Promise identifier
   * @param {any} payload
   */
  resolve(id, payload) {
    const { resolve } = this.#retrieve(id)
    return resolve(payload)
  }

  /**
   * Rejects a promise by its identifier.
   *
   * @param {any} id Promise identifier
   * @param {any} payload
   */
  reject(id, payload) {
    const { reject } = this.#retrieve(id)
    return reject(payload)
  }

  /**
   * Cancels all promises.
   */
  cancelAll() {
    for (const [id] of this.#executors) {
      this.cancel(id)
    }
  }

  /**
   * Resolves all promises.
   *
   * @param {any} payload
   */
  resolveAll(payload) {
    for (const [id] of this.#executors) {
      this.resolve(id, payload)
    }
  }

  /**
   * Rejects all promises.
   *
   * @param {any} payload
   */
  rejectAll(payload) {
    for (const [id] of this.#executors) {
      this.reject(id, payload)
    }
  }
}

export default PromiseMap
