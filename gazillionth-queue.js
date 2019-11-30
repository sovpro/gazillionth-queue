const {EventEmitter}   = require ('events')

// property symbols
const concurrency_sym  = Symbol ()
const active_sym       = Symbol ()
const started_sym      = Symbol ()
const timer_sym        = Symbol ()
const tasks_sym        = Symbol ()

// method symbols
const activate_sym     = Symbol ()
const taskify_sym      = Symbol ()
const run_sym          = Symbol ()
const start_sym        = Symbol ()
const set_timer_sym    = Symbol ()
const end_sym          = Symbol ()

const TIMING = 16

function queueTaskCallback (tracker, error) {
  tracker.invoked = true
  this[active_sym] -= 1
  if (error)
    this.emit ('error', error)
}

function queueTask (fn) {
  let tracker = { invoked: false }
  const callback = queueTaskCallback.bind (this, tracker)
  try {
    fn (callback)
  }
  catch (error) {
    if (tracker.invoked === false)
      callback (error)
  }
}

class GazillionthQueue extends EventEmitter {

  constructor ({concurrency}) {
    super ()
    this[concurrency_sym]  = concurrency
    this[tasks_sym]        = []
    this[active_sym]       = 0
    this[started_sym]      = false
    this[run_sym]          = this[run_sym].bind (this)
    this[start_sym] ()
  }

  [start_sym] () {
    if (this.started ||
        this.length === 0) return

    this[started_sym] = true
    this[set_timer_sym] ()
  }

  [end_sym] () {
    if (this.started === false ||
        this.length ||
        this.active) return false

    clearTimeout (this[timer_sym])
    this[started_sym] = false
    this.emit ('done')
    return true
  }

  [run_sym] () {
    if (this[end_sym]()) return
    this[activate_sym] ()
    this[set_timer_sym] ()
  }

  [set_timer_sym] () {
    this[timer_sym] = setTimeout (this[run_sym], TIMING)
  }

  get concurrency () {
    return this[concurrency_sym]
  }

  get active () {
    return this[active_sym]
  }

  get length () {
    return this[tasks_sym].length
  }

  get started () {
    return this[started_sym]
  }

  push (fn) {
    this[start_sym] ()
    this[tasks_sym].push (fn)
  }

  unshift (fn) {
    this[start_sym] ()
    this[tasks_sym].unshift (fn)
  }

  [taskify_sym] (fn) {
    // bind named function for string
    // output as "[Function: bound queueTask]"
    return queueTask.bind (this, fn)
  }

  [activate_sym] () {
    let activated = 0

    while (this.length &&
           this.active < this.concurrency) {
      this[active_sym] += 1
      process.nextTick (
        this[taskify_sym] (this[tasks_sym].shift ())
      )
      activated += 1
    }

    if (activated) {
      this.emit ('activated', activated)
    }
  }

}

exports.GazillionthQueue = GazillionthQueue

