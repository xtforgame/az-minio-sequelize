/* eslint-disable import/prefer-default-export */
import React, { useState, useEffect } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose } from 'recompose';
import { setSelectedProjectId } from '~/containers/App/actions';
import modelMapEx from '~/containers/App/modelMapEx';
import {
  FormFieldButton,
} from '~/components/FormInputs';

import {
  makeDefaultProjectSelector,
  makeSelectedProjectIdSelector,
} from '~/containers/App/selectors';

const styles = theme => ({
});

const ProjectDropdown = (props) => {
  const {
    classes,
    dispatch,
    setSelectedProjectId,
    projects,
    defaultProject,
    projectId,
    ...p
  } = props;

  useEffect(() => {
    const projArray = Object.values(projects);
    if (projectId == null && projArray.length) {
      setSelectedProjectId(projArray[0].id);
    }
  }, [projects, projectId]);

  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuItemClick = (event, index, projectId) => {
    setOpen(false);
    setSelectedProjectId(projectId);
  };

  const getMenuItmes = () => {
    const projectArray = (projects && Object.values(projects)) || [];
    projectArray.sort((a, b) => a.organization_id - b.organization_id);
    return (projectArray).map((project, i) => (
      <MenuItem
        key={project.id}
        selected={(!!defaultProject && project.id === defaultProject.id) || (project.id === projectId)}
        onClick={event => handleMenuItemClick(event, i, project.id)}
      >
        {`${project.organization.name}-${project.name}`}
      </MenuItem>
    ));
  };

  const handleClick = (event) => {
    setOpen(true);
    setAnchorEl(event.currentTarget);
  };

  const handleRequestClose = () => {
    setOpen(false);
  };

  return (
    <React.Fragment>
      <FormFieldButton
        {...p}
        margin="dense"
        onClick={handleClick}
        label="專案"
        value={(defaultProject && `${defaultProject.organization.name}-${defaultProject.name}`) || '<未選取>'}
      >
        {`${(defaultProject && defaultProject.name) || '<未選取>'}`}
      </FormFieldButton>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleRequestClose}
      >
        {getMenuItmes()}
      </Menu>
    </React.Fragment>
  );
};

const mapStateToProps = createStructuredSelector({
  projects: modelMapEx.cacher.selectorCreatorSet.project.selectResourceMapValues(),
  defaultProject: makeDefaultProjectSelector(),
  projectId: makeSelectedProjectIdSelector(),
});

export default compose(
  connect(mapStateToProps, {
    setSelectedProjectId,
  }),
  withStyles(styles),
)(ProjectDropdown);
