import { Job, JobStatus } from "./src/models/job";
import { Scheduler } from "./src/models/scheduler";
import { SyncTask } from "./src/models/task";


const everySecond = () => {
    console.log('First Task - every second...');
}

const every3Seconds = () => {
    console.log('Second Task - every three seconds...');
}

const scheduler = new Scheduler();

const task = new SyncTask('firstTask', everySecond);
const task2 = new SyncTask('secondTask', every3Seconds);

const job = new Job(task, { seconds: 1, runAtStart: true });
const job2 = new Job(task2, { seconds: 3 })

scheduler.addJob(job);
scheduler.addJob(job2);

setInterval(() => {
    console.log('Scheduler status');
    console.log(scheduler.status());
}, 6000);

setTimeout(()=>{
    job2.stop();
}, 18000);


setTimeout(()=>{
    scheduler.stop();
    process.exit()
}, 25000)



process.on('uncaughtException', (e, o) => {
    console.log(e.message);
})


process.on('unhandledRejection', (r, p) => {
    console.log(r);
})

