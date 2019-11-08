import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import DialogContent from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';
import SimpleFullScreenDialog from '~/components/Dialogs/SimpleFullScreenDialog';
import { FormTextField, FormSpace } from '~/components/FormInputs';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    height: '100%',
    flexDirection: 'column',
    background: theme.palette.background.default,
    padding: 8,
  },
}));

export default (props) => {
  const {
    open,
    value: v,
    onClose,
    ...dialogProps
  } = props;

  // const classes = useStyles();
  const [value] = useState(v);
  const [metadata, setMetadata] = useState((v && v.image && v.image.metadata) || {});

  const handleClose = result => () => {
    if (result) {
      const newValue = {
        ...value,
        image: {
          ...value.image,
          metadata: {
            ...value.image.metadata,
            ...result.metadata,
          },
        },
      };
      return onClose(newValue);
    }
    return onClose(result);
  };

  const submit = handleClose({
    metadata,
  });

  return (
    <SimpleFullScreenDialog
      title="Edit Image"
      {...dialogProps}
      open={open}
      onClose={handleClose()}
      headerContent={(
        <Button
          color="inherit"
          onClick={submit}
        >
          save
        </Button>
      )}
    >
      <DialogContent>
        <FormSpace variant="content2" />
        <FormTextField
          label="Owner"
          value={metadata.owner || ''}
          onPressEnter={submit}
          onChange={(e) => {
            const owner = e.target.value;
            setMetadata(m => ({
              ...m,
              owner,
            }));
          }}
          autoFocus
          // margin="dense"
          fullWidth
        />
        <FormSpace variant="content2" />
        <FormTextField
          label="Source"
          value={metadata.source || ''}
          onPressEnter={submit}
          onChange={(e) => {
            const source = e.target.value;
            setMetadata(m => ({
              ...m,
              source,
            }));
          }}
          // margin="dense"
          fullWidth
        />
      </DialogContent>
    </SimpleFullScreenDialog>
  );
};
