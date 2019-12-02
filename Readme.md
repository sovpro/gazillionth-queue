# Gazillionth Queue

One in gazillions of queue implementations. 

## Constructor

The constructor requires an object having a "concurrency" property with an unsigned integer value.

```js
// instantiate a queue to invoke
// two queued functions at a time 
const queue = new GazillionthQueue ({
  concurrency: 2
})
```

## Add to queue 

Functions in to the queue are invoked with a single callback 
that should be invoked with the function has completed its work.

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

