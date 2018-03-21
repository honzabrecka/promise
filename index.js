const pending = 0
const resolved = 1
const rejected = 2

const isPromiseLike = (v) => {
  if (!v || ['object', 'function'].indexOf(typeof v) === -1) return
  const then = v.then
  if (!then || typeof then !== 'function') return
  return then
}

const first = ([v]) => v
const second = ([_, v]) => v

const run = (promise, res, rej) => {
  const $ = (result) => {
    let done = false
    let then

    const x = (f) => (value) => {
      if (done) return
      done = true
      f(value)
    }

    try {
      if (result === promise)
        rej(new TypeError(''))
      else if (then = isPromiseLike(result))
        then.call(result, x($), x(rej))
      else
        res(result)
    } catch (e) {
      if (!done) rej(e)
    }
  }
  return $
}

class P {

  constructor(f) {
    this.state = pending
    this.thens = []

    const x = (state, selector) => (value) => {
      if (this.state !== pending) return
      this.state = state
      this.value = value
      this.thens.forEach((then) => selector(then)(value))
    }

    f(x(resolved, first), x(rejected, second))
  }

  then(onResolve, onReject) {
    let resolve, reject

    const promise = new P((res, rej) => {
      const x = (f, cb) => (value) => {
        process.nextTick(() => {
          if (typeof f !== 'function') {
            cb(value)
            return
          }

          try {
            run(promise, res, rej)(f(value))
          } catch (e) {
            rej(e)
          }
        })
      }

      resolve = x(onResolve, res)
      reject = x(onReject, rej)
    })

    if (this.state === pending) {
      this.thens.push([resolve, reject])
    } else if (this.state === resolved) {
      resolve(this.value)
    } else {
      reject(this.value)
    }

    return promise
  }

}

module.exports = {
  P,
}
