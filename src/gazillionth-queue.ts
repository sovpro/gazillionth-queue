import {EventEmitter}   from 'events'

interface TaskDoneCallbackTracker {
  invoked: boolean;
}

interface QueueConfig {
  concurrency?: number
  active_wait?: number
}

type TaskDoneCallback = (tracker: TaskDoneCallbackTracker) => void;
type TaskFunction = (done: TaskDoneCallback) => void;

function queueTaskCallback (tracker: TaskDoneCallbackTracker) {
  if (tracker.invoked) return
  tracker.invoked = true
  this._active -= 1
}

function queueTask (fn: TaskFunction) {
  let tracker: TaskDoneCallbackTracker = { invoked: false }
  const callback = queueTaskCallback.bind (this, tracker)
  try {
    fn (callback)
  }
  catch (error) {
    callback (error)
    this.emit ('error', error)
  }
}

export class GazillionthQueue extends EventEmitter {

  private _concurrency: number
  private _active: number
  private _started: boolean
  private _timer: NodeJS.Timeout
  private _tasks: Function[]
  private _wait: number

  constructor ({
      concurrency = 1
    , active_wait = 16
  } = {}) {
    super ()
    this._run          = this._run.bind (this)
    this._tasks        = []
    this._active       = 0
    this._started      = false
    this._concurrency  = concurrency
    this._wait         = active_wait
    this._start ()
  }

  _start () {
    if (this.started ||
        this.length === 0) return

    this._started = true
    this._setTimer ()
  }

  _end () {
    if (this.started === false ||
        this.length > 0 ||
        this.active > 0) return false

    this._resetTimer ()
    this._started = false
    this.emit ('done')
    return true
  }

  _resetTimer () {
    clearTimeout (this._timer)
    this._timer = null
  }

  _run () {
    if (this._end()) return
    this._resetTimer ()
    this._activate ()
    this._setTimer ()
  }

  _setTimer () {
    if (this._timer) return
    this._timer = setTimeout (this._run, this.active_wait)
  }

  get concurrency () {
    return this._concurrency
  }

  set concurrency (value) {
    const new_value = Math.max (0, value)
    const old_value = this._concurrency
    this._concurrency = new_value
    if (this.started &&
        new_value > old_value) {
      this._setTimer ()
    }
  }

  get active_wait () {
    return this._wait
  }

  set active_wait (value) {
    this._wait = Math.max (0, value)
  }

  get active () {
    return this._active
  }

  get length () {
    return this._tasks.length
  }

  get started () {
    return this._started
  }

  clear (): number {
    if (this.length === 0) return 0
    const num_cleared = this.length
    this._tasks.length = 0
    this.emit ('cleared', num_cleared)
    this._end ()
    return num_cleared
  }

  push (fn: Function) {
    this._tasks.push (fn)
    this._start ()
  }

  unshift (fn: Function) {
    this._tasks.unshift (fn)
    this._start ()
  }

  _taskify (fn: Function): TaskFunction {
    // bind named function for string
    // output as "[Function: bound queueTask]"
    return queueTask.bind (this, fn)
  }

  _activate () {
    let activated = 0

    while (this.length &&
           this.active < this.concurrency) {
      this._active += 1
      process.nextTick (
        this._taskify (this._tasks.shift ())
      )
      activated += 1
    }

    if (activated) {
      this.emit ('activated', activated)
    }
  }

}
