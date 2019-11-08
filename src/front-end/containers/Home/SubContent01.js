import React from 'react';
import { getHeaders } from '~/utils/HeaderManager';
import Editor from '@stfy/react-editor.js';

import header from '@editorjs/header';
import list from '@editorjs/list';
import image from '@editorjs/image';
import embed from '@editorjs/embed';
import quote from '@editorjs/quote';
import marker from '@editorjs/marker';
import code from '@editorjs/code';
import link from '@editorjs/link';
import delimiter from '@editorjs/delimiter';
import raw from '@editorjs/raw';
import table from '@editorjs/table';
import warning from '@editorjs/warning';
import paragraph from '@editorjs/paragraph';
import checklist from '@editorjs/checklist';

export default () => (
  <Editor
    tools={{
      header,
      list,
      image: {
        class: image,
        config: {
          field: 'file',
          additionalRequestHeaders: getHeaders(),
          endpoints: {
            byFile: './api/files', // Your backend file uploader endpoint
            byUrl: './api/fileUrls', // Your endpoint that provides uploading by Url
          },
        },
      },
      embed,
      quote,
      marker,
      code,
      link: {
        class: link,
        config: {
          endpoint: './api/fetchUrl',
        },
      },
      delimiter,
      raw,
      table,
      warning,
      paragraph: {
        class: paragraph,
        inlineToolbar: true,
      },
      checklist,
    }}
    onReady={() => console.log('Start!')}
    onData={e => console.log('data', e)}
    onChange={e => console.log('change', e)}
    data={{
      time: new Date().getTime(),
      blocks: [
        {
          type: 'header',
          data: {
            text: 'Hello Editor.js',
            level: 2,
          },
        },
      ],
      version: '2.15.0',
    }}
  />
);
