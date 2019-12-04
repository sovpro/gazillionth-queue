const assert             = require ('assert')
const {GazillionthQueue} = require ('./gazillionth-queue')

testBasics (2)
  .then (() => testBasics (1))
  .then (() => console.log ('Done'))

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
      assert (error_count === 1, 'An error event should have been emitted')
      resolve ()
    })

    queue.on ('error', (error) => {
      console.log (`error event: ${error.message}`)
      error_count++
    })

    console.log ('push #1')
    queue.push ((done) => {
      console.log (`Executing #1 in #${++dequeued_funcs} position`)

      assert (
          ++current_concurrency <= concurrency
        , `Concurrency should be ${concurrency}`
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
        , `Concurrency should be ${concurrency}`
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
        , `Concurrency should be ${concurrency}`
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
        , `Concurrency should be ${concurrency}`
      )

      throw new Error ('Test error')
    })


  })

 return promise
}
