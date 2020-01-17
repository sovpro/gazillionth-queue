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
const reset_timer_sym  = Symbol ()
const end_sym          = Symbol ()
const wait_sym         = Symbol ()

function queueTaskCallback (tracker) {
  if (tracker.invoked) return
  tracker.invoked = true
  this[active_sym] -= 1
}

function queueTask (fn) {
  let tracker = { invoked: false }
  const callback = queueTaskCallback.bind (this, tracker)
  try {
    fn (callback)
  }
  catch (error) {
    callback (error)
    this.emit ('error', error)
  }
}

class GazillionthQueue extends EventEmitter {

  constructor ({
      concurrency = 1
    , active_wait = 16
  } = {}) {
    super ()
    this[run_sym]          = this[run_sym].bind (this)
    this[tasks_sym]        = []
    this[active_sym]       = 0
    this[started_sym]      = false
    this.concurrency       = concurrency
    this.active_wait       = active_wait
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
        this.length > 0 ||
        this.active > 0) return false

    this[reset_timer_sym] ()
    this[started_sym] = false
    this.emit ('done')
    return true
  }

  [reset_timer_sym] () {
    clearTimeout (this[timer_sym])
    this[timer_sym] = null
  }

  [run_sym] () {
    this[reset_timer_sym] ()
    if (this[end_sym]()) return
    this[activate_sym] ()
    this[set_timer_sym] ()
  }

  [set_timer_sym] () {
    if (this[timer_sym]) return
    this[timer_sym] = setTimeout (this[run_sym], this.active_wait)
  }

  get concurrency () {
    return this[concurrency_sym]
  }

  set concurrency (value) {
    const new_value = Math.max (0, value)
    const old_value = this[concurrency_sym]
    this[concurrency_sym] = new_value
    if (this.started &&
        new_value > old_value) {
      this[set_timer_sym] ()
    }
  }

  get active_wait () {
    return this[wait_sym]
  }

  set active_wait (value) {
    this[wait_sym] = Math.max (0, value)
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
    this[tasks_sym].push (fn)
    this[start_sym] ()
  }

  unshift (fn) {
    this[tasks_sym].unshift (fn)
    this[start_sym] ()
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

