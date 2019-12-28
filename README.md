# Gazillionth Queue

One in gazillions of queue implementations. 

[![Build status for Node.js 8 10 12](https://github.com/sovpro/gazillionth-queue/workflows/Node.js%208%2010%2012%20/badge.svg?branch=master)](https://github.com/sovpro/gazillionth-queue/commits/master)

## Constructor

The constructor accepts a (optional) configuration to set [concurrency](#concurrency) and [active_wait](#active_wait) values at instantiation.

```js
// instantiate a queue to have up to 2
// dequeued functions active at a time and
// an active wait time of 50 milliseconds
const queue = new GazillionthQueue ({
  concurrency: 2 ,
  active_wait: 50
})
```

## Add to queue 

Functions in the queue are executed with a "done" callback argument
that should be invoked once the function has completed its work.

- [push](#push)
- [unshift](#unshift)

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

## Properties

- [concurrency](#concurrency)
- [active_wait](#active_wait)
- [started](#started) *read-only*
- [length](#length) *read-only*
- [active](#active) *read-only*

### concurrency

The maximum number of callbacks that should be active at a time.

`concurrency` is an unsigned integer with a default value of 1.

Setting `concurrency` to a number value less than 1 pauses the queue. To resume the queue, `concurrency` should be set to a number value greater than 0.

### active_wait

The suggested amount of time to wait, in milliseconds, before dequeueing more functions.

Each time the number of [active](#active) functions drops below the configured [concurrency](#concurrency) the queue will wait the time specified by `active_wait` before filling the concurrency quota.

`active_wait` is an unsigned integer value with a default value of 16 milliseconds.

### started

A *read-only* boolean flag indicating whether there are functions in the queue or dequeued functions that are still active. Each time [done](#done) is emitted `started` will become `false` again.

### length

A *read-only* count of functions in the queue that are not active.

### active

A *read-only* count of dequeued functions that have been invoked and that have not finished their work by calling `done ()`.

## Events

- [activated](#activated)
- [done](#done)
- [error](#error)

### activated

Emitted with an integer representing the count of functions that are dequeued to be invoked, each time functions are dequeued.

### done

Emitted each time the queue becomes empty and is not [active](#active).

### error

Emitted with an error each time a queued function throws an uncaught error.
