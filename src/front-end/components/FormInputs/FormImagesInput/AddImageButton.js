
/* eslint-disable jsx-a11y/label-has-associated-control, no-underscore-dangle */
/* eslint-disable react/prop-types, react/forbid-prop-types, jsx-a11y/label-has-associated-control */
import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import FormFileInput from '../FormFileInput';
import createButtonStyles from '~/styles/Buttons';

const styles = theme => ({
  fab: {
    boxShadow: 'none',
  },
  ...createButtonStyles(theme, 'success'),
});

const AddImageButton = (props) => {
  const {
    classes,
    color = 'primary',
    Icon = AddIcon,
    buttonProps,
    iconProps,
    ...inputProps
  } = props;
  return (
    <div
      style={{
        position: 'relative',
        width: 48,
        height: 48,
        padding: 4,
        marginRight: 8,
      }}
    >
      <FormFileInput
        accept="image/*"
        {...inputProps}
        readFileOption={{ hash: true }}
        inputProps={{
          multiple: 'multiple',
          value: '',
        }}
      >
        <Fab
          component="span"
          size="small"
          color={color}
          aria-label="add"
          classes={{
            primary: classes.containedPrimary,
          }}
          className={classes.fab}
          {...buttonProps}
        >
          <Icon {...iconProps} />
        </Fab>
      </FormFileInput>
    </div>
  );
};

export default withStyles(styles)(AddImageButton);
