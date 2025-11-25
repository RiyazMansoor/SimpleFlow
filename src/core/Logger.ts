
// import fs from 'fs';


export interface Logger {

    error(message?: any, ...optionalParams: any[]): void;
    info(message?: any, ...optionalParams: any[]): void;
    log(message?: any, ...optionalParams: any[]): void;

};

export class ConsoleLogger implements Logger {

    private readonly loggerName: string;

    constructor(loggerName: string) {
        this.loggerName = loggerName;
    };

    public error(message?: any, ...optionalParams: any[]): void {
        console.error(this.loggerName, message, ...optionalParams);
    }
    
    public info(message?: any, ...optionalParams: any[]): void {
        console.info(this.loggerName, message, ...optionalParams);
    };
    
    public log(message?: any, ...optionalParams: any[]): void {
        console.log(this.loggerName, message, ...optionalParams);
    };

};

export class FileLogger implements Logger {

    private readonly fileName: string;

    constructor(fileName: string = "WorkflowServiceLogger.txt") {
        this.fileName = fileName;
    };

    public error(message?: any, ...optionalParams: any[]): void {
        console.error(this.fileName, message, ...optionalParams);
    }
    
    public info(message?: any, ...optionalParams: any[]): void {
        console.info(this.fileName, message, ...optionalParams);
    };
    
    public log(message?: any, ...optionalParams: any[]): void {
        console.log(this.fileName, message, ...optionalParams);
    };

};


/*

function logToFile(message) {
  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp} - ${message}\n`;

  fs.appendFile('application.log', logEntry, (err) => {
    if (err) {
      console.error('Failed to write to log file:', err);
    }
  });
}

logToFile('Application started.');
logToFile('User logged in: John Doe');
logToFile('Error: Database connection failed.');

*/
