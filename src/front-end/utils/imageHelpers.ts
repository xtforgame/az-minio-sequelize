import crypto from 'crypto';

// http://code.hootsuite.com/html5/
export function isUploadSupported() {
  if (navigator.userAgent.match(/(Android (1.0|1.1|1.5|1.6|2.0|2.1))|(Windows Phone (OS 7|8.0))|(XBLWP)|(ZuneWP)|(w(eb)?OSBrowser)|(webOS)|(Kindle\/(1.0|2.0|2.5|3.0))/)) { // eslint-disable-line max-len
    return false;
  }
  return true;
}

export function isFileReaderSupported() {
  return window.File && window.FileReader && window.FormData;
}

export const defaultHashFunc = data => crypto
  .createHash('sha256')
  .update(data, 'binary').digest('hex');

export type ProcessFileResult = {
  file : string;
  fileName : string;
  fileType : string;
  dataURL : string;
  hash?: string;
};

export function processFile(dataURL, file, options : any = {}) : Promise<ProcessFileResult> {
  const fileName = file.name;
  const fileType = file.type;
  const doHash = !!options.hash;
  const hashFunc = (typeof options.hash === 'function' ? options.hash : defaultHashFunc);

  const searchRegex = /data:(.*);base64,([a-zA-Z0-9+/=]*)/g;
  const dataUrlRegexResult = searchRegex.exec(dataURL || '');

  const result : ProcessFileResult = {
    file,
    fileName,
    fileType,
    dataURL,
  };
  if (doHash && dataUrlRegexResult) {
    result.hash = hashFunc(atob(dataUrlRegexResult[2]));
    // console.log('result.hash :', result.hash);
  }

  return Promise.resolve(result);
}

export const readFile = (file, options = {}) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onloadend = () => {
    // console.log('reader.result, file :', reader.result, file);
    processFile(reader.result, file, options).then(resolve, reject);
  };

  reader.onerror = () => {
    reject(new Error('There was an error reading the file!'));
  };

  reader.readAsDataURL(file);
});
