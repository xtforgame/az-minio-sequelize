/* eslint-disable react/prop-types, react/forbid-prop-types */
import React from 'react';
import TextField from '@material-ui/core/TextField';
import { OnAddImageInfo, OnEditImageInfo, GetContent } from './ImagesInput';
import FormImagesInputContent from './FormImagesInputContent';
import { ImageInfo, HandleUpload } from './uploadContext';

export * from './uploadContext';
export * from './array-helpers';
export { default as uploadContext } from './uploadContext';

export type Props = {
  id : string;
  value : ImageInfo[];
  onChange : Function;
  imagesInputProps : any;
  handleUpload : HandleUpload;
  onAdd : OnAddImageInfo;
  onEdit?: OnEditImageInfo;
  getContent?: GetContent;
  lightboxZIndex?: number;
  [s : string] : any;
};

export default ({
  id,
  value,
  onChange,
  imagesInputProps,
  handleUpload,
  onAdd,
  onEdit,
  getContent,
  lightboxZIndex,
  ...props
} : Props) => (
  <TextField
    id={id}
    variant="outlined"
    {...props}
    value=" "
    InputProps={{
      inputComponent: FormImagesInputContent,
      inputProps: {
        imagesInputProps: {
          ...imagesInputProps,
          handleUpload,
          onAdd,
          onEdit,
          getContent,
          lightboxZIndex,
          id: id ? `${id}-input` : 'input',
          value: value || [],
          thumbSize: 96,
          onChange: (iis) => {
            // console.log('iis :', iis);
            if (onChange) {
              onChange(iis);
            }
          },
        },
      },
    }}
    onChange={(e) => {
      if (e.stopPropagation && e.preventDefault) {
        e.stopPropagation();
        e.preventDefault();
      } else {
        const { onChange } = props;
        if (onChange) {
          onChange(e);
        }
      }
    }}
    onClick={(e) => {
      // e.stopPropagation();
      // e.preventDefault();
      const { onClick } = props;
      if (onClick) {
        onClick(e);
      }
    }}
  />
);
