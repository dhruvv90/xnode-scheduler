import { Job } from "./src/models/job";
import { Scheduler } from "./src/models/scheduler";
import { SyncTask } from "./src/models/task";


const myFunc = ()=>{
    console.log('Test...');
}

const scheduler = new Scheduler();
const task = new SyncTask('testTask', myFunc, (e)=> console.log(e));
const job = new Job(task, {seconds: 2, runAtStart: true});

scheduler.addJob(job);

setTimeout(()=>{
    console.log(scheduler.status());
    scheduler.stop();
}, 8000);

process.on('uncaughtException',(e,o)=>{
    console.log(e.message);
})


process.on('unhandledRejection', (r,p)=>{
    console.log(r);
})

