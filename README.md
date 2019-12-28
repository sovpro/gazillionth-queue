# Gazillionth Queue

One in gazillions of queue implementations. 

## Constructor

The constructor accepts a (optional) configuration to set [concurrency](#concurrency) and [active_wait](#active-wait) values at instantiation.

```js
// instantiate a queue to have up to 2
// callbacks active at a time and
// an active wait time of 50 milliseconds
const queue = new GazillionthQueue ({
  concurrency: 2 ,
  active_wait: 50
})
```

## Configuration

The properties of the constructor configuration parameter are also instance properties that can be set after instantiation.

### Concurrency

`concurrency` is the maximum number of callbacks that should be active at a time. It is an unsigned integer value, that if left unspecified, defaults to 1. Setting `concurrency` to a number value less than 1 pauses the queue. To resume the queue, set `concurrency` to a number greater than 0.

### Active Wait

`active_wait` is the suggested amount of time to wait before invoking more callbacks from the queue. Each time the number of active callbacks drops below the concurrency setting the queue will wait the time specified by `active_wait` before filling the concurrency quota. `active_wait` is an unsigned integer value representing time in milliseconds. If it is left unspecified the value defaults to 16 milliseconds.

## Add to queue 

Functions in the queue are executed with a callback argument
that should be invoked once the function has completed its work.

There are two methods to add a function to the queue: 

### Push

Add a function to the end of the queue:

```js
queue.push ((done) => {
  // do stuff
  done ()
})
```

### Unshift

Put a function at the start of the queue:

```js
queue.unshift ((done) => {
  // do stuff
  done ()
})
```

## Events

The following events are emitted:

### activated

Emitted with an integer representing the number of functions that are dequeued to be invoked, each time functions are dequeued.

### done

Emitted each time the queue becomes empty.

### error

Emitted with an error each time a queued function throws an uncaught error.

```js
queue.on ('error', (error) => {
  // do something with the error
})
```
