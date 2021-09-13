import { Scheduler } from './index';
import { JobSync } from './lib';


const everySecond = () => {
    console.log('First Task - every second...');
}

const every3Seconds = () => {
    console.log('Second Task - every three seconds...');
}

const scheduler = new Scheduler();

const job1 = new JobSync(everySecond, {seconds: 1});
const job2 = new JobSync(every3Seconds, { seconds: -1 }, 'job2');


scheduler.addJob(job1);
scheduler.addJob(job2);

setInterval(() => {
    console.log('Scheduler status');
    console.log(scheduler.status());
    console.log(job1.status)
    console.log(job2.status)
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

