import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles(theme => ({
  inline: {
    display: 'inline',
  },
}));

export default (props) => {
  const classes = useStyles();
  const {
    member,
    labels,
    onClick,
    action,
  } = props;

  return (
    <ListItem
      button
      onClick={onClick}
      alignItems="flex-start"
    >
      <ListItemAvatar>
        <Avatar alt="Logo" src={member.picture || './mail-assets/logo.png'} />
      </ListItemAvatar>
      <ListItemText
        primary={`${member.name}(ID: ${member.id})`}
        secondary={(
          <React.Fragment>
            <Typography
              component="span"
              variant="body2"
              className={classes.inline}
              color="textPrimary"
            >
              識別名稱
            </Typography>
            {` — ${labels.identifier || '<無>'}`}
          </React.Fragment>
        )}
      />
      {action}
    </ListItem>
  );
};
