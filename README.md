# x-node-job-scheduler
Simple In-memory job scheduler for Node.js


const dataFetcher = () => void;

scheduler = new Scheduler();

scheduler.addJob(new Task(dataFetcher, dataFetcher, error), {minutes: 20, runAtStart: true});

or

const job1 = new Job(task, schedulerOptions)
scheduler.addJob(job1)

