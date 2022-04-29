
const logger = require('node-file-logger');
const options = {
    timeZone: 'Europe/Madrid',
    folderPath: './logs/',      
    dateBasedFileNaming: true,
    // Required only if dateBasedFileNaming is set to true
    fileNamePrefix: 'Logs_',
    fileNameSuffix: '',
    fileNameExtension: '.log',     
    
    dateFormat: 'YYYY-MM-DD',
    timeFormat: 'HH:mm:ss.SSS',
    logLevel: 'debug',
    onlyFileLogging: true
  }
logger.SetUserOptions(options); // Options are optional
export { logger };
