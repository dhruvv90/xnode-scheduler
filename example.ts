import { Job, Scheduler, SyncTask, AsyncTask } from './index';


const everySecond = () => {
    console.log('First Task - every second...');
}

const every3Seconds = () => {
    console.log('Second Task - every three seconds...');
}

const scheduler = new Scheduler();

const job1 = new Job(everySecond, { seconds: -1 }, { id: 'job1' });
const job2 = new Job(every3Seconds, { seconds: 2147483647 }, {id: 'testtttt'});


scheduler.addJob(job1);
scheduler.addJob(job2);

setInterval(() => {
    console.log('Scheduler status');
    console.log(scheduler.status());
    console.log(job1.getStatus())
    console.log(job2.getStatus())
}, 6000);

setTimeout(() => {
    job2.stop();
}, 18000);


setTimeout(() => {
    scheduler.stop();
    process.exit()
}, 25000)



process.on('uncaughtException', (e, o) => {
    console.log(e.message);
})


process.on('unhandledRejection', (r, p) => {
    console.log(r);
})

