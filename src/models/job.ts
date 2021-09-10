import { Task } from "./task";

export enum JobStatus {
    NOT_STARTED,
    RUNNING,
    STOPPED
};

type SchedulerOptions = {
    milliseconds?: number,
    seconds?: number,
    minutes?: number,
    hours?: number,
    days?: number,
    runAtStart?: boolean
}

const getMilliseconds = (options: SchedulerOptions): number => {
    const {
        milliseconds = 0,
        seconds = 0,
        minutes = 0,
        hours = 0,
        days = 0,
    } = options;

    return milliseconds * 1
        + seconds * 1000
        + minutes * 60 * 1000
        + hours * 60 * 60 * 1000
        + days * 24 * 60 * 60 * 1000
}

export class Job {

    private id: number;
    private readonly task: Task;
    private status: JobStatus;
    private readonly schedulerOptions: SchedulerOptions;

    constructor(task: Task, schedulerOptions: SchedulerOptions) {
        this.task = task;
        this.schedulerOptions = schedulerOptions;
        this.status = JobStatus.NOT_STARTED;
    }

    /**
     * Start a job or restart a job if already running
     *  */
    start(): void {
        // already running
        this.id ? this.stop() : null;

        if(this.schedulerOptions.runAtStart){
            this.task.handle();
        }
        this.id = setInterval(this.task.handle, getMilliseconds(this.schedulerOptions));
        this.status = JobStatus.RUNNING;
    }

    stop(): void {
        if(!this.id){
            return;
        }
        clearInterval(this.id);
        this.status = JobStatus.STOPPED;
        this.id = undefined;
    }

    getStatus(): JobStatus {
        return this.status;
    }

}
