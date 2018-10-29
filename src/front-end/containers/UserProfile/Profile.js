/* eslint-disable jsx-a11y/label-has-associated-control, no-underscore-dangle */
import React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import grey from '@material-ui/core/colors/grey';
import SuccessButton from '~/components/Buttons/SuccessButton';
import Centered from '~/components/Layout/Centered';
import EditableCardLayout from '~/components/FormLayouts/EditableCardLayout';
import {
  FormSpace,
} from '~/components/FormInputs';
import {
  createIgnoredPreset,
  FormTextFieldPreset,
  mwpListItemDisplayer,
  addOnPressEnterEvent,
} from '~/utils/InputLinker/helpers';
import {
  ContainerConfig,
  EditableConfig,
  EditableCardMediaPreset,
  EditableAvatarPreset,
  EditableFabButtonPreset,
} from '~/components/LinkerPresets';

import {
  makeMyUserSelector,
} from '~/containers/App/selectors';

import modelMapEx from '~/containers/App/modelMapEx';

const bgImg = './images/StockSnap_3FOSIEZDTW.jpg';

const {
  user: userP,
} = modelMapEx.querchy.promiseActionCreatorSets;

const styles = theme => ({
  spaceAfterMedia: {
    height: 55,
  },
  mainContainer: {
    width: '100%',
  },

  avatarContainer: {
    position: 'relative',
    height: '100%',
  },

  editButton: {
    margin: 'auto',
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 8,
  },

  bigAvatar: {
    // margin: 10,
    color: '#fff',
    backgroundColor: grey[500],
    width: 96,
    height: 96,
  },

  card: {
    width: 300,
    [theme.breakpoints.up('sm')]: {
      width: 345,
    },
  },
});

const createTextInputPreset = (name, label) => ({
  presets: [FormTextFieldPreset, addOnPressEnterEvent('handleSubmit')],
  name,
  extraProps: {
    label,
    fullWidth: true,
  },
});

const editableGetSpace = ({ link: { hostProps: { isEditing } }, key }) => (isEditing ? <FormSpace key={key} variant="content2" /> : <FormSpace key={key} variant="content0" />);

const getFields = classes => [
  {
    presets: [EditableCardMediaPreset(150)],
    name: 'bannerImg',
    extraChildElements: [
      new ContainerConfig([
        {
          presets: [EditableFabButtonPreset],
          mwRender: { className: classes.editButton },
        },
        {
          presets: [EditableAvatarPreset],
          name: 'avatarImg',
          mwRender: { className: classes.bigAvatar },
        },
      ], {
        component: Centered,
        mwRender: { className: classes.avatarContainer },
      }, () => undefined),
    ],
  },
  {
    presets: [createIgnoredPreset('div')],
    mwRender: { className: classes.spaceAfterMedia },
  },
  new ContainerConfig([
    new EditableConfig(createTextInputPreset('name', 'Name'), () => Centered, (ctx) => {
      const { props, link: { name, hostProps } } = ctx;
      ctx.props = {
        key: props.key,
        children: (
          <Typography gutterBottom variant="h5" component="h2">
            {hostProps.defaultValues[name]}
          </Typography>
        ),
      };
    }),
    new EditableConfig(
      new ContainerConfig([
        new EditableConfig(createTextInputPreset('email', 'Email'), () => ListItem, mwpListItemDisplayer),
        new EditableConfig(createTextInputPreset('bio', 'Bio'), () => ListItem, mwpListItemDisplayer, null, () => ({
          multiline: true,
          rows: 1,
          rowsMax: 10,
        })),
      ], {}, editableGetSpace),
      () => List, null, () => React.Fragment
    ),
  ], { component: CardContent }, editableGetSpace),
  new EditableConfig(
    { presets: [createIgnoredPreset(React.Fragment)] },
    null, null,
    () => FormSpace, { variant: 'content2' }
  ),
  new EditableConfig(
    new ContainerConfig([
      new EditableConfig(
        createIgnoredPreset(SuccessButton),
        () => React.Fragment, (ctx) => { ctx.props = { key: ctx.props.key }; },
        null, ({ link: { host } }) => ({
          size: 'small',
          variant: 'contained',
          fullWidth: true,
          color: 'primary',
          onClick: host.handleSubmit,
          children: 'Save',
        })
      ),
    ], {}, editableGetSpace),
    () => React.Fragment, null, () => CardActions
  ),
];

class Profile extends React.PureComponent {
  state = { isEditing: false };

  submit = (values) => {
    const {
      user = {},
    } = this.props;

    let p = Promise.resolve();

    if (user.id != null) {
      const patchData = {};
      if (values.name) {
        patchData.name = values.name;
      }
      if (values.email) {
        patchData.data = {
          ...user.data,
          ...patchData.data,
          email: values.email,
        };
      }
      if (values.bio) {
        patchData.data = {
          ...user.data,
          ...patchData.data,
          bio: values.bio,
        };
      }
      if (values.avatarImg) {
        patchData.picture = values.avatarImg;
      }
      p = userP.update(user.id, patchData);
    }
    p.then(() => {
      this.setState({
        isEditing: false,
      });
    })
    .catch((e) => {
      console.error('Failed to update user info :', e);
    });
  }

  render() {
    const {
      classes,
      user,
    } = this.props;

    const { isEditing } = this.state;

    const {
      name,
      picture: avatarImg,
      data: {
        bio,
        email,
      } = {},
    } = user || {};

    return (
      <Centered className={classes.mainContainer}>
        <EditableCardLayout
          className={classes.card}
          user={user}
          bgImg={bgImg}
          fields={getFields(classes)}
          defaultValues={{
            name,
            bannerImg: bgImg,
            avatarImg,
            bio,
            email,
          }}
          isEditing={isEditing}
          onStartEditing={() => this.setState({ isEditing: true })}
          onCancelEditing={() => this.setState({ isEditing: false })}
          onSubmit={this.submit}
        />
      </Centered>
    );
  }
}

const mapStateToProps = createStructuredSelector({
  user: makeMyUserSelector(),
});

export default compose(
  connect(mapStateToProps, {}),
  withStyles(styles),
)(Profile);
