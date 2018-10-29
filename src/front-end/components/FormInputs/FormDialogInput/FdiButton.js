/* eslint-disable react/prop-types, react/forbid-prop-types */
import React from 'react';
import TextField from '@material-ui/core/TextField';

const Content = ({ inputRef, ...props }) => (
  <pre {...props} style={{ height: 'auto' }}>
    {props.value || <br />}
  </pre>
);

export default props => (
  <TextField
    variant="outlined"
    {...props}
    InputLabelProps={{ shrink: !!props.value }}
    InputProps={{
      inputComponent: Content,
      inputProps: {
        tabIndex: 0,
        style: {
          cursor: 'pointer',
        },
      },
    }}
    onKeyDown={(event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        const { onKeyDown } = props;
        if (onKeyDown) {
          onKeyDown(event);
        }
      }
    }}
    onClick={(e) => {
      e.stopPropagation();
      e.preventDefault();
      const { onClick } = props;
      if (onClick) {
        onClick(e);
      }
    }}
  />
);
