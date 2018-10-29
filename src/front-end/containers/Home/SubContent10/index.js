import React, { useState, useEffect, useRef } from 'react';
import { createStructuredSelector } from 'reselect';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Divider from '@material-ui/core/Divider';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import FormDialogInput from '~/components/FormInputs/FormDialogInput';
import { useConnect } from '~/hooks/redux-react-hook-ex';
import CrudDialogEx from '~/components/Dialogs/CrudDialogEx';
import modelMapEx from '~/containers/App/modelMapEx';
import CrudForm from './CrudForm';
import {
  makeSelectedProjectSelector,
} from '~/containers/App/selectors';
import MemberListItem from '../shared/MemberListItem';

const {
  user,
  // userSetting,
  // organization,
  // project,
} = modelMapEx.querchy.promiseActionCreatorSets;

const mapStateToProps = createStructuredSelector({
  userQueryMap: modelMapEx.cacher.selectorCreatorSet.user.selectQueryMap(),
  selectedProject: makeSelectedProjectSelector(),
});

const mapDispatchToProps = {};

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
  inline: {
    display: 'inline',
  },
}));

export default (props) => {
  const {
    dialogProps,
  } = props;

  const classes = useStyles();
  const {
    userQueryMap: {
      metadata,
      values,
    },
    selectedProject,
  } = useConnect(mapStateToProps, mapDispatchToProps);

  const projectMemberQueryName = selectedProject && `./api/projects/${selectedProject.organization_id}/members`;
  const orgMemberQueryName = selectedProject && `./api/organizations/${selectedProject.id}/members`;

  // const projectMemberMetadata = metadata[projectMemberQueryName] || {};
  // const projectMembers = values[projectMemberQueryName] || [];

  const orgMemberMetadata = metadata[orgMemberQueryName] || {};
  const orgMembers = values[orgMemberQueryName] || [];

  const [searchText, setSearchText] = useState('');

  const [reqTime, setReqTime] = useState(0);
  const [, forceUpdate] = useState({});
  const loaded = useRef(0);
  const [value, setValue] = useState(null);

  useEffect(() => {
    if (!selectedProject) {
      return;
    }
    loaded.current = 0;
    setReqTime(new Date().getTime());
    user.getCollection({ queryId: projectMemberQueryName, actionProps: { url: projectMemberQueryName } })
    .then((x) => {
      loaded.current++;
      forceUpdate({});
    });
    user.getCollection({ queryId: orgMemberQueryName, actionProps: { url: orgMemberQueryName } })
    .then((x) => {
      loaded.current++;
      forceUpdate({});
    });
  }, [selectedProject]);

  const isReady = selectedProject
    && reqTime
    // && projectMemberMetadata && projectMemberMetadata.requestTimestamp >= reqTime
    && orgMemberMetadata && orgMemberMetadata.requestTimestamp >= reqTime
    && loaded.current === 2;

  const onSubmit = async (value, editingParams, index) => {
    const { editingSource } = editingParams;
    if (!editingSource) {
      await user.create(value, { queryId: orgMemberQueryName, actionProps: { url: orgMemberQueryName } });
      setReqTime(new Date().getTime());
      await user.getCollection({ queryId: orgMemberQueryName, actionProps: { url: orgMemberQueryName } })
      .then((x) => {
        forceUpdate({});
      });
    } else {
      await user.update(index, value, { queryId: orgMemberQueryName, actionProps: { url: `${orgMemberQueryName}/${editingSource.id}` } });
      setReqTime(new Date().getTime());
      await user.getCollection({ queryId: orgMemberQueryName, actionProps: { url: orgMemberQueryName } })
      .then((x) => {
        forceUpdate({});
      });
    }
  };

  const renderAddItem = ({
    handleItemClick,
  }) => (
    <React.Fragment>
      <ListItem button onClick={() => handleItemClick({ defaultText: searchText })}>
        <ListItemAvatar>
          <Avatar alt="Logo" src="./mail-assets/logo.png" />
        </ListItemAvatar>
        <ListItemText primary={searchText ? `<新增 '${searchText}...'>` : '<新增成員>'} />
      </ListItem>
      <Divider />
    </React.Fragment>
  );

  const renderListItem = ({
    handleItemClick,
  }, value) => (
    <MemberListItem
      key={value.id}
      member={value}
      labels={value.labels}
      onClick={handleItemClick}
    />
  );

  const onSearchTextChange = t => setSearchText(t);
  const onStartSearch = () => setSearchText('');
  const onFinishSearch = () => setSearchText('');

  return (
    <FormDialogInput
      label="DateRange"
      value={value}
      displayValue={() => 'XX'}
      renderButton={({ buttonProps }) => (
        <Button
          variant="contained"
          color="primary"
          disabled={!isReady}
          {...buttonProps}
        >
          編輯組織
        </Button>
      )}
      onChange={setValue}
      // buttonProps={{
      //   fullWidth: true,
      // }}
      dialogProps={dialogProps}
      renderDialog={({
        label,
        title,
        open,
        handleClose,
        value,
        dialogProps,
      }) => (
        <CrudDialogEx
          list={searchText ? orgMembers.filter(item => (item.name || '').includes(searchText)) : orgMembers}
          addItemPlacement="start"
          renderAddItem={renderAddItem}
          renderListItem={renderListItem}
          CrudForm={CrudForm}
          value={value}
          onSubmit={onSubmit}
          onSearchTextChange={onSearchTextChange}
          onStartSearch={onStartSearch}
          onFinishSearch={onFinishSearch}
          texts={{
            edit: '編輯成員',
            create: '新增成員',
            pick: '選擇成員',
          }}
          {...dialogProps}
        />
      )}
    />
  );
};
