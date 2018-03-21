const { P } = require('./index')

const deferred = () => {
  let resolve = null
  let reject = null

  const promise = new P((res, rej) => {
    resolve = res
    reject = rej
  })

  return {
    promise,
    resolve,
    reject,
  }
}

module.exports = {
  deferred,
  resolved: P.resolved,
  rejected: P.rejected,
}
