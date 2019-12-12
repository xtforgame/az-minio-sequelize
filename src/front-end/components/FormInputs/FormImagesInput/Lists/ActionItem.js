// @flow
import React, { Component } from 'react';
import InfoIcon from '@material-ui/icons/Info';

const Avatar = React.forwardRef((props, ref) => {
  const {
    src,
    alt,
    isDragging,
    isGroupedOver,
    ...divProps
  } = props;
  return (
    <div
      {...divProps}
      style={{
        boxSizing: 'content-box',
        width: 144,
        height: 44,
        marginRight: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderStyle: 'dashed',
        background: isGroupedOver ? 'rgba(255, 0, 0, 0.5)' : 'transparent',
      }}
      ref={ref}
    >
      <InfoIcon
        style={{
          marginTop: 4,
          marginLeft: 54,
          width: 36,
          height: 36,
        }}
      />
    </div>
  );
});

export default class ActionItem extends Component {
  render() {
    const {
      action,
      provided,
      snapshot,
    } = this.props;

    const {
      style,
      ...draggableProps
    } = provided.draggableProps;

    // console.log('snapshot :', snapshot);

    // console.log('provided :', provided);
    // console.log('provided.draggableProps.style :', provided.draggableProps.style);

    // console.log('this.props.isGroupedOver :', this.props.isGroupedOver);

    return (
      <Avatar
        ref={ref => provided.innerRef(ref)}
        {...draggableProps}
        {...provided.dragHandleProps}
        src={action.imgUrl}
        alt={action.name}
        isDragging={snapshot.isDragging}
        isGroupedOver={this.props.isGroupedOver}
      />
    );
  }
}
