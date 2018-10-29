import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Typography from '@material-ui/core/Typography';
import Collapse from '@material-ui/core/Collapse';
import SwipeableCardMediaT1 from '~/components/Card/SwipeableCardMediaT1';
import useExpansion from '~/components/Card/useExpansion';
import lizard from './contemplative-reptile.jpg';

const useStyles = makeStyles(theme => ({
  card: {
    maxWidth: 345,
  },
  expand: {
    marginLeft: 'auto',
    [theme.breakpoints.up('sm')]: {
      marginRight: 0,
    },
  },
}));

export default (props) => {
  const {
    content,
  } = props;
  const classes = useStyles();
  const {
    iconButtonClassName,
    expanded,
    toggleExpanded,
  } = useExpansion({
    defaultExpanded: 'defaultExpanded' in props ? props.defaultExpanded : false,
    iconButtonClassName: classes.expand,
  });

  return (
    <div>
      <Card className={classes.card}>
        <SwipeableCardMediaT1
          images={[lizard, lizard]}
        />
        <CardContent>
          <Typography variant="h5" component="h2">
            Lizard
          </Typography>
          <Typography component="p">
            Lizards are a widespread group of squamate reptiles, with over 6,000 species, ranging
            across all continents except Antarctica
          </Typography>
        </CardContent>
        <CardActions disableSpacing>
          <Button dense="true" color="primary">
            Share
          </Button>
          <IconButton
            className={iconButtonClassName}
            onClick={toggleExpanded}
            aria-expanded={expanded}
            aria-label="Show more"
          >
            <ExpandMoreIcon />
          </IconButton>
        </CardActions>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <CardContent>
            <Typography variant="h5" component="h2">
              Lizard
            </Typography>
            <Typography component="p">
              Lizards are a widespread group of squamate reptiles, with over 6,000 species, ranging
              across all continents except Antarctica
            </Typography>
          </CardContent>
          {content}
        </Collapse>
      </Card>
    </div>
  );
};
