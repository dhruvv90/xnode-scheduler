const defaultErrorHandler = function (name: string) {
    return (e: Error): void => {
        console.log(`Error in running task with name : ${name} with error - ${e.message}`);
    }
}

export interface Task {
    handle(): void;
}

export class SyncTask implements Task {
    private readonly name: string;
    private readonly handler: () => void;
    private readonly errorHandler: (err: Error) => void;

    constructor(name: string, handler: () => void, errorHandler?: (e: Error) => void) {
        this.name = name;
        this.handler = handler;
        this.errorHandler = errorHandler || defaultErrorHandler(this.name);
    }

    handle(): void {
        try {
            this.handler();
        }
        catch (e) {
            this.errorHandler(e);
        }
    }
}


export class AsyncTask implements Task {
    private readonly name: string;
    private readonly handler: () => Promise<void>;
    private readonly errorHandler: (err: Error) => void;

    constructor(name: string, handler: () => Promise<void>, errorHandler?: (e: Error) => void) {
        this.name = name;
        this.handler = handler;
        this.errorHandler = errorHandler || defaultErrorHandler(this.name);
    }

    handle(): void {
        this.handler().catch(this.errorHandler);
    }
}