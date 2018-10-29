import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import DialogContent from '@material-ui/core/DialogContent';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Switch from '@material-ui/core/Switch';

import { FormTextField, FormSpace } from '~/components/FormInputs';

const useStyles = makeStyles(theme => ({
}));

export default (props) => {
  const {
    editingParams: {
      defaultText,
      editingSource,
    },
    // onDone,
    onCancel,
    onSubmit,
  } = props;

  const [disabled, setDisabled] = useState(
    (
      editingSource
      && editingSource.userOrganization.labels
    ) ? !!editingSource.userOrganization.labels.disabled : false
  );
  const [identifier, setIdentifier] = useState(
    (
      editingSource
      && editingSource.userOrganization.labels
      && editingSource.userOrganization.labels.identifier
    )
    || defaultText
  );

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const toggleDisabled = () => {
    setDisabled(!disabled);
  };

  const submit = () => onSubmit({
    // ...editingSource,
    username,
    password,
    disabled,
    name: identifier,
    identifier: identifier || '',
  });

  const renderDisabledSwitch = () => (
    <List>
      <ListItem
        button
        onClick={toggleDisabled}
      >
        {/* <ListItemIcon>
          <CloseIcon />
        </ListItemIcon> */}
        <ListItemText primary="啟用/停用" secondary={disabled ? '停用' : '啟用'} />
        <ListItemSecondaryAction>
          <Switch
            onChange={toggleDisabled}
            checked={!disabled}
          />
        </ListItemSecondaryAction>
      </ListItem>
    </List>
  );

  const fields = editingSource ? (
    <React.Fragment>
      {renderDisabledSwitch()}
      <FormTextField
        label="電子信箱"
        value={editingSource.data.email || ''}
        disabled
        margin="dense"
        fullWidth
      />
      <FormTextField
        label="識別名稱"
        value={identifier || ''}
        onChange={e => setIdentifier(e.target.value)}
        autoFocus
        margin="dense"
        fullWidth
      />
    </React.Fragment>
  ) : (
    <React.Fragment>
      {renderDisabledSwitch()}
      <FormTextField
        label="帳號名稱"
        value={username}
        onChange={e => setUsername(e.target.value)}
        margin="dense"
        fullWidth
      />
      <FormSpace variant="content2" />
      <FormTextField
        label="密碼"
        value={password}
        onChange={e => setPassword(e.target.value)}
        margin="dense"
        fullWidth
      />
      <FormSpace variant="content2" />
      <FormTextField
        label="識別名稱"
        value={identifier || ''}
        onChange={e => setIdentifier(e.target.value)}
        margin="dense"
        fullWidth
      />
    </React.Fragment>
  );

  return (
    <DialogContent>
      {fields}
      <FormSpace variant="content2" />
      <div style={{ display: 'flex' }}>
        <Button
          variant="contained"
          onClick={onCancel}
        >
          取消
        </Button>
        <div style={{ flex: 1 }} />
        <Button
          variant="contained"
          color="primary"
          onClick={submit}
        >
          {editingSource ? '更新' : '新增'}
        </Button>
      </div>
    </DialogContent>
  );
};
