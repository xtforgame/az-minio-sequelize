import React from 'react';
import ImagesInput from './ImagesInput';

export default (props) => {
  const {
    imagesInputProps = {},
  } = props;
  return (
    <div
      style={{
        width: '100%',
        paddingTop: 8,
        paddingBottom: 4,
        paddingLeft: 4,
        paddingRight: 4,
      }}
    >
      <ImagesInput
        {...props}
        {...imagesInputProps}
      />
    </div>
  );
};
