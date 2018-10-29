import fs from 'fs';

const logFiles = {};

const write = (file, data) => {
  const logFile = logFiles[file] = logFiles[file] || fs.createWriteStream(file, { flags: 'w' }); // eslint-disable-line no-multi-assign, max-len
  logFile.write(data);
};

export default write;
