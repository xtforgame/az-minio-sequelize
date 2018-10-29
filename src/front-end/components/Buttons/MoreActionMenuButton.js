import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MoreVertIcon from '@material-ui/icons/MoreVert';

class EnhancedTableActionMenuButton extends React.PureComponent {
  state = {
    anchorEl: null,
    open: false,
  };

  handleClick = (event) => {
    this.setState({
      anchorEl: event.currentTarget,
      open: true,
    });
  };

  handleClose = () => {
    this.setState({
      anchorEl: null,
      open: false,
    });
  };

  render() {
    const { parentId, getActionMenuItems = () => null, ...props } = this.props;
    const { anchorEl, open } = this.state;

    return (
      <div>
        <IconButton
          aria-label="More"
          aria-haspopup="true"
          onClick={this.handleClick}
        >
          <MoreVertIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={this.handleClose}
          {...props}
        >
          {getActionMenuItems(this.handleClose)}
        </Menu>
      </div>
    );
  }
}

export default EnhancedTableActionMenuButton;
