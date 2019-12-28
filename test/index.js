const assert             = require ('assert')
const {GazillionthQueue} = require ('./../')

testBasics (2)
  .then (() => testBasics (1))
  .then (() => testSingle (1))
  .then (() => testConcurrency ())
  .then (() => console.log ('Done'))

function testConcurrency () {
  console.log ('Test concurrency')

  console.log (' - instantiate with concurrency at 0')
  const queue = new GazillionthQueue ({concurrency: 0})

  const concurrencyTask = new Promise ((fulfill) => {
    const timer = setTimeout (() => {
      throw new Error ('Task not invoked after concurrency increase from 0')
    }, 500)

    queue.once ('done', () => fulfill ())

    queue.push ((done) => {
     clearTimeout (timer);
     done ()
    })

    setTimeout (() => {
      assert (
        queue.length === 1 ,
        'An immediately paused queue should have a ' +
        'length equal to the number of items added'
      )
      console.log (' - increase concurrency to 1')
      queue.concurrency = 1
    }, 300)
  })

  return concurrencyTask
}

function testSingle (concurrency) {
  console.log ('Test single item queue')

  const queue = new GazillionthQueue ({concurrency})

  const singleTask = new Promise ((fulfill) => {
    const timer = setTimeout (() => {
      throw new Error ('Single task not invoked')
    }, 300)

    queue.once ('done', () => fulfill ())

    queue.push ((done) => {
     clearTimeout (timer);
     done ()
    })
  })

  return singleTask
}

function testBasics (concurrency) {
  console.log (`Test basics with concurreny at ${concurrency}`)

  const promise = new Promise ((resolve) => {

    const queue = new GazillionthQueue ({concurrency})
    let current_concurrency = 0
    let dequeued_funcs = 0
    let error_count = 0

    queue.on ('activated', (num_funcs_activated) => {
      console.log (`activated event: ${num_funcs_activated} functions activated`)
      assert (
          num_funcs_activated <= concurrency
        , `More than ${concurrency} functions were activated`
      )
    })

    queue.on ('done', () => {
      console.log (`done event`)
      console.log ('error count: %d', error_count)
      assert (queue.length === 0, 'The queue should be empty when done')
      assert (queue.active === 0, 'No functions should be active when done')
      assert (error_count === 2, 'An error event should have been emitted twice')
      resolve ()
    })

    queue.on ('error', error => {
      if (error.message.indexOf ('Test') !== 0) {
        throw error
      }
      console.log (`error event: ${error.message}`)
      error_count++
    })

    console.log ('push #1')
    queue.push ((done) => {
      console.log (`Executing #1 in #${++dequeued_funcs} position`)

      assert (
          ++current_concurrency <= concurrency
        , `Concurrency should be ${concurrency} not ${current_concurrency}`
      )

      setTimeout (() => {
        current_concurrency--
        done ()
      }, 1000)
    })

    console.log ('push #2')
    queue.push ((done) => {
      console.log (`Executing #2 in #${++dequeued_funcs} position`)

      assert (
          ++current_concurrency <= concurrency
        , `Concurrency should be ${concurrency} not ${current_concurrency}`
      )

      setTimeout (() => {
        current_concurrency--
        done ()
      }, 100)
    })

    console.log ('unshift #3')
    queue.unshift ((done) => {
      console.log (`Executing #3 in #${++dequeued_funcs} position`)

      assert (
          ++current_concurrency <= concurrency
        , `Concurrency should be ${concurrency} not ${current_concurrency}`
      )
 
      assert (
          dequeued_funcs === 1
        , 'Queued function #3 should run in #1 position'
      )

      setTimeout (() => {
        current_concurrency--
        done ()
      }, 100)
    })

    console.log ('push #4')
    queue.push ((done) => {
      console.log (`Executing #4 in #${++dequeued_funcs} position`)

      assert (
          ++current_concurrency <= concurrency
        , `Concurrency should be ${concurrency} not ${current_concurrency}`
      )

      console.log (' - throw error after calling done()')
      done ()
      current_concurrency--
      throw new Error ('Test error after done')
    })

    console.log ('push #5')
    queue.push ((done) => {
      console.log (`Executing #5 in #${++dequeued_funcs} position`)

      assert (
          ++current_concurrency <= concurrency
        , `Concurrency should be ${concurrency} not ${current_concurrency}`
      )

      console.log (' - throw error without calling done()')
      throw new Error ('Test error without done')
    })

  })

 return promise
}
