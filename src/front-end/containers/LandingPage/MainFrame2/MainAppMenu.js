import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import DraftsIcon from '@material-ui/icons/Drafts';
import SendIcon from '@material-ui/icons/Send';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import StarBorder from '@material-ui/icons/StarBorder';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    // maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
}));

export default function NestedList() {
  const classes = useStyles();
  const [openSubList, setOpenSubList] = React.useState(null);

  const handleSubListClick = listName => () => {
    setOpenSubList(openSubList === listName ? null : listName);
  };

  return (
    <List
      component="nav"
      aria-labelledby="nested-list-subheader"
      // subheader={(
      //   <ListSubheader component="div" id="nested-list-subheader">
      //     Nested List Items
      //   </ListSubheader>
      // )}
      className={classes.root}
    >
      <ListItem button>
        {/* <ListItemIcon>
          <SendIcon />
        </ListItemIcon> */}
        <ListItemText primary="Home" />
      </ListItem>
      <ListItem button onClick={handleSubListClick('about-us')}>
        {/* <ListItemIcon>
          <InboxIcon />
        </ListItemIcon> */}
        <ListItemText primary="About Us" />
        {openSubList === 'about-us' ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={openSubList === 'about-us'} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItem button className={classes.nested}>
            {/* <ListItemIcon>
              <StarBorder />
            </ListItemIcon> */}
            <ListItemText primary="Maintainers" />
          </ListItem>
        </List>
      </Collapse>
      <ListItem button onClick={handleSubListClick('contact-us')}>
        {/* <ListItemIcon>
          <InboxIcon />
        </ListItemIcon> */}
        <ListItemText primary="Contact Us" />
        {openSubList === 'contact-us' ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={openSubList === 'contact-us'} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItem button className={classes.nested}>
            {/* <ListItemIcon>
              <StarBorder />
            </ListItemIcon> */}
            <ListItemText primary="E-Mail" />
          </ListItem>
          <ListItem button className={classes.nested}>
            {/* <ListItemIcon>
              <StarBorder />
            </ListItemIcon> */}
            <ListItemText primary="Facebook" />
          </ListItem>
        </List>
      </Collapse>
    </List>
  );
}
