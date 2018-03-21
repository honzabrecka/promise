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

const run = (promise, resolve, reject) => {
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
        reject(new TypeError('I don\'t think so, muhehe.'))
      else if (then = isPromiseLike(result))
        then.call(result, x($), x(reject))
      else
        resolve(result)
    } catch (error) {
      if (!done) reject(error)
    }
  }
  return $
}

class P {

  constructor(f) {
    this.state = pending
    this.thens = []

    const x = (finalState, selector) => (value) => {
      if (this.state !== pending) return
      this.state = finalState
      this.value = value
      this.thens.forEach((then) => selector(then)(value))
    }

    f(x(resolved, first), x(rejected, second))
  }

  then(onResolve, onReject) {
    let resolve$, reject$

    const promise = new P((resolve, reject) => {
      const x = (f, cb) => (value) => {
        process.nextTick(() => {
          if (typeof f !== 'function') {
            cb(value)
            return
          }

          try {
            run(promise, resolve, reject)(f(value))
          } catch (error) {
            reject(error)
          }
        })
      }

      resolve$ = x(onResolve, resolve)
      reject$ = x(onReject, reject)
    })

    if (this.state === pending) {
      this.thens.push([resolve$, reject$])
    } else if (this.state === resolved) {
      resolve$(this.value)
    } else {
      reject$(this.value)
    }

    return promise
  }

}

P.resolved = (value) => new P((resolve, _) => { resolve(value) })

P.rejected = (error) => new P((_, reject) => { reject(error) })

module.exports = {
  P,
}
