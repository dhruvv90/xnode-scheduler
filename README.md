# xnode-scheduler

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]

Simple In-memory Node.js job scheduler library to execute tasks within fixed intervals
* Useful to run sync/async(promise based) jobs every fixed interval with delay 'x'. Uses NodeJS **SetInterval** under the wraps.
* Not suitable to run cron expressions **yet**
* Supports `milliseconds`, `seconds`, `minutes`, `hours`, `days` as inputs. Range of delays supported : `1 millisecond` to `2147483646 milliseconds`
* Created in Typescript.
* No dependency on any external package
* Does not support caching
* Created for NodeJS. Not yet tested for browsers.


## Getting started

Installation:

```bash
npm i xnode-scheduler
```

Usage Example:

```js
const { JobStatus, IntervalBasedJob, XnodeScheduler } = require('../dist/index');

// Create Scheduler instance
const scheduler = new XnodeScheduler();

// Define job and errorHandler(optional)
const fn = function() { counter++}
const errorHandler = function(error){ console.log(error.message )}

// Create Jobs
const j1 = new IntervalBasedJob('j1', fn, { seconds: 1 });
const j2 = new IntervalBasedJob('j2', fn, { hours: 2 }, {
    async: true,
    errorHandler: (error)=>{console.log(error)},
    runImmediately: true
});

// Add Jobs to scheduler
scheduler.addJob(j1);
scheduler.addJob(j2);

scheduler.removeJob('jn'); // Removes and stops the job

scheduler.getJob('jx') // throws error for non existent Job ID

const test = scheduler.getJob('j1');
assert(test instanceof IntervalBasedJob);

// Stop a particular job
scheduler.stopJob('j1');

// Job Statuses mapped to JobStatus Enum
assert(j1.status === JobStatus.STOPPED);

// Individual Jobs can also be stopped directly through Job instance
j2.stop();

// Scheduler Status
scheduler.status();

// Stop All running jobs
scheduler.stop()
```

## Notes for Usage

* For asyncronous Jobs, we need to provide `async : true` within JobOptions. Using sync tasks with `async:true` might lead to unhandled rejections. 
* This library does not do throttling or caching.
* Firing too many async Jobs in a short interval might lead to queuing up requests - leading to low performance. Delays should be used with caution.
* For Async Jobs, it is highly recommended to use promise chaining instead of async/await pattern within function definition. This is to avoid memory leaks due to calling contexts.

## Error Handling
* For both sync/async, `JobOptions` has errorHandler function which takes `e: Error` parameter.
* This is optional and if not provided (or falsy), default error handler will print the Job ID + error message to console.
* For Async Jobs, the error handler function is appended to the function chain as a `.catch()` block at the end.


# API Documentation

## IntervalBasedJob

* `constructor(id: string, fn, intervalOptions: IntervalOptions, jobOptions: JobOptions)`
    * `id`: Unique Job ID to be used to Query Jobs and stop/remove
    * `fn`: Task function definition - can be sync/async function
    * `intervalOptions`: Interval timer settings. API described below
    * `jobOptions`: Job Settings. API described below

* `id` and `status` can be accessed directly.
* `status: JobStatus` - stores the status of the job, which can be `NOT_STARTED`, `RUNNING`, `STOPPED`. `JobStatus` enum can be used to validate status at any state.
* `start(): void` - starts, or restarts (if it's already running) the job;
* `stop(): void` - stops the job. Can be restarted again with `start` command
* A Job can be started and stopped any number of times.


## IntervalOptions

* `days?: number` - how many days to wait before executing the job for the next time
* `hours?: number` - how many hours to wait before executing the job for the next time
* `minutes?: number` - how many minutes to wait before executing the job for the next time
* `seconds?: number` - how many seconds to wait before executing the job for the next time
* `milliseconds?: number` - how many milliseconds to wait before executing the job for the next time

## JobOptions
* `async?: boolean` - Whether the task is asynchronous
* `errorHandler?: Fn(e:Error)` - Error handler for each invocation. Optional - By default - it prints Job ID and error message to console.
* `runImmediately?: boolean` - If true, Job's first run will be immediately when started. By default - it is undefined.


## XnodeScheduler

* A scheduler instance can have only 1 job by a unique name.
* `addJob(j: JobSync | JobAsync) : void` - Add Job by ID within scheduler and Start it.
* `getJob(id: string): JobSync | JobAsync` - Get Job by ID. For invalid IDs , error is thrown
* `startJob(id: string): void` - Start a Job by ID. For invalid IDs, error is thrown
* `stopJob(id: string): void` - Start a Job by ID. For invalid IDs, error is thrown
* `removeJob(id: string)` - Stops the given job and removes it from scheduler. For invalid IDs , No error is thrown.
* `stop(): void` - Stop all jobs in scheduler
* `status()` - Returns a POJO representing various metrics related to current statuses of all jobs.


[npm-image]: https://img.shields.io/npm/v/xnode-scheduler?style=plastic
[npm-url]: https://www.npmjs.com/package/xnode-scheduler
[downloads-image]: https://img.shields.io/npm/dw/xnode-scheduler?style=plastic
[downloads-url]: https://www.npmjs.com/package/xnode-scheduler

