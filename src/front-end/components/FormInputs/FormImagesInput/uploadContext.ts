
/* eslint-disable jsx-a11y/label-has-associated-control, no-underscore-dangle */
/* eslint-disable react/prop-types, react/forbid-prop-types, jsx-a11y/label-has-associated-control */
import React from 'react';
import axios from 'axios';
import * as Rx from 'rxjs';
import { ProcessFileResult } from '~/utils/imageHelpers';
import { getHeaders } from '~/utils/HeaderManager';

// https://gist.github.com/virolea/e1af9359fe071f24de3da3500ff0f429
// https://developer.mozilla.org/zh-TW/docs/Web/API/Blob
// const formData = new FormData();
// const debug = { hello: 'world' };
// const blob = new Blob([JSON.stringify(debug, null, 2)], { type: 'application/json' });
// formData.append('file', blob, 'someFileName.bin');
// return axios({
//   method: 'post',
//   url: '/api/files',
//   headers: {
//     'Content-Type': 'multipart/form-data',
//   },
//   data: formData,
//   onUploadProgress: (progressEvent) => {
//     const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
//     console.log(percentCompleted);
//   },
// });

export type ObservableInfo = {
  uploadProgressSubject: Rx.BehaviorSubject<number>;
};

export type ImageInfo = {
  id : string;
  content?: string;
  imageUploadInfo?: ProcessFileResult,
  image: {
    id : string;
    imgUrl : string;
    hash : string;
    name : string;
    metadata : {
      [s : string] : any;
    };
  },
};

export const observableInfo : {
  [resourceId: string] : ObservableInfo;
} = {};

export type GetObservableInfo = (resourceId: string) => ObservableInfo;

export const getObservableInfo = (resourceId: string) => observableInfo[resourceId];

export type HandleUpload = (
  imageInfo : ImageInfo,
  uploadProgressSubject : Rx.BehaviorSubject<number>,
) => Promise<any>;

export const createHandleUploadFunction = urlBase => async (
  imageInfo : ImageInfo,
  uploadProgressSubject : Rx.BehaviorSubject<number>,
) => {
  const imageUploadInfo = imageInfo.imageUploadInfo!;
  let data : any;
  try {
    ({ data } = await axios({
      method: 'options',
      url: `${urlBase}/${imageUploadInfo.hash}`,
      headers: {
        ...getHeaders(),
      },
    }));
  } catch (error) {
    return Promise.resolve(null);
  }

  if (data['content-type']) {
    uploadProgressSubject.next(100);
    // uploadProgressSubject.complete();
    return Promise.resolve(null);
  }

  const searchRegex = /data:(.*);base64,([a-zA-Z0-9+/=]*)/g;
  const dataUrlRegexResult = searchRegex.exec(imageUploadInfo.dataURL || '');
  if (!dataUrlRegexResult) {
    return Promise.resolve(null);
  }

  const byteCharacters = atob(dataUrlRegexResult[2]);
  const byteNumbers : number[] = Array.from({ length: byteCharacters.length });
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);

  const fileBlob = new Blob([byteArray], { type: imageUploadInfo.fileType });
  // const metadataBlob = new Blob([JSON.stringify({ a: 1 })], { type: 'application/json' });

  const formData = new FormData();
  formData.append('file', fileBlob, imageUploadInfo.fileName);
  // formData.append('metadata', metadataBlob, `${imageUploadInfo.fileName}.metadata`);
  // console.log('imageUploadInfo.hash :', imageUploadInfo.hash);
  await axios({
    method: 'post',
    url: urlBase,
    headers: {
      ...getHeaders(),
      'Content-Type': 'multipart/form-data',
    },
    data: formData,
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      // console.log(percentCompleted);
      uploadProgressSubject.next(percentCompleted);
      // if (percentCompleted >= 100) {
      //   uploadProgressSubject.complete();
      // }
    },
  })
  .then(({ data }) => {
    // console.log('data.hash :', data.hash);
  });

  // uploadProgressSubject.subscribe((data) => {
  //   console.log('Subscriber Test:', data);
  // });
  return Promise.resolve(null);
};

// export const defaultHandleUpload = createHandleUploadFunction('/api/files');

export type UploadImage = (
  imageInfo : ImageInfo,
  handleUpload : HandleUpload,
) => Promise<any>;

export const uploadImage = (
  imageInfo : ImageInfo,
  // handleUpload : HandleUpload = defaultHandleUpload,
  handleUpload : HandleUpload,
) => {
  const {
    imageUploadInfo,
  } = imageInfo;
  if (getObservableInfo(imageUploadInfo!.hash!)) {
    return Promise.resolve(null);
  }

  const uploadProgressSubject = new Rx.BehaviorSubject<number>(0);
  if (imageUploadInfo!.hash) {
    observableInfo[imageUploadInfo!.hash!] = {
      uploadProgressSubject,
    };
  }

  return handleUpload(imageInfo, uploadProgressSubject);
};

export type Context = {
  getObservableInfo: GetObservableInfo,
  uploadImage: UploadImage,
};

export const isImageUploaded = (
  imageInfo : ImageInfo,
) => {
  if (!imageInfo.imageUploadInfo) {
    return true;
  }

  const observableInfo = getObservableInfo(imageInfo.imageUploadInfo.hash!);
  if (!observableInfo) {
    return false;
  }
  return observableInfo.uploadProgressSubject.getValue() >= 100;
};

export default React.createContext<Context>({
  getObservableInfo,
  uploadImage,
});
