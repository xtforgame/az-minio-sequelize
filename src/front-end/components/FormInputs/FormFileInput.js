/* eslint-disable react/prop-types, react/forbid-prop-types, jsx-a11y/label-has-associated-control */
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { readFile } from '~/utils/imageHelpers';
import { promiseReduce } from 'common/utils';

const styles = theme => ({
  input: {
    display: 'none',
  },
});

const FormFileInput = (props) => {
  const {
    id,
    classes,
    accept,
    onLoadEnd = () => {},
    onChange = () => {},
    children,
    inputProps,
    labelProps,
    readFileOption = {},
  } = props;
  return (
    <React.Fragment>
      <input
        {...inputProps}
        accept={accept}
        className={classes.input}
        id={id}
        type="file"
        onChange={(e) => {
          onChange(e);
          const files = Array.from(e.target.files);
          promiseReduce(files, (_, file) => readFile(file, readFileOption)
          .then((imgInfo) => {
            onLoadEnd(imgInfo);
          }));
        }}
      />
      <label
        {...labelProps}
        htmlFor={id}
      >
        {children}
      </label>
    </React.Fragment>
  );
};

FormFileInput.propTypes = {
  id: PropTypes.string.isRequired,
};

export default withStyles(styles)(FormFileInput);
