/* eslint-disable react/prop-types, react/forbid-prop-types */
import React from 'react';
import TextField from '@material-ui/core/TextField';
import withOnPressEnterEvent from './withOnPressEnterEvent';

const Content = ({ inputRef, ...props }) => (
  <div {...props}>
    {props.value || <br />}
  </div>
);

export default withOnPressEnterEvent(props => (
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
    onClick={(e) => {
      e.stopPropagation();
      e.preventDefault();
      const { onClick } = props;
      if (onClick) {
        onClick(e);
      }
    }}
  />
));
