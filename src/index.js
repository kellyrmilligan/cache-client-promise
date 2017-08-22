// @flow
export default class ClientCache {
  cache = {};

  clear (key: string | null = null) {
    if (key) {
      delete this.cache[key]
    } else {
      this.cache = {}
    }
  }

  resolveAllPromises (key: string, data: any) {
    this.cache[key]
      .promises
      .forEach(function (resolve) {
        resolve(data)
      })
  }

  get (key: string, request: Function) {
    return new Promise((resolve, reject) => {
      if (!request) {
        const data = this.cache[key]
          ? this.cache[key].data
          : null
        resolve(data)
      }
      if (this.cache[key] && this.cache[key].data) {
        resolve(this.cache[key].data)
        return
      }
      if (!this.cache[key]) {
        this.cache[key] = {
          promises: [],
          data: null
        }
        request()
          .then((data) => {
            this.cache[key].data = data
            resolve(data)
            if (this.cache[key].promises.length > 0) {
              this.resolveAllPromises(key, data)
            }
          })
          .catch((reason) => {
            delete this.cache[key]
            reject(reason)
          })
      } else {
        this.cache[key].promises.push(resolve)
      }
    })
  }
}
