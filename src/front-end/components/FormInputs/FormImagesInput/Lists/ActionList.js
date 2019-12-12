// @flow
import React, { Component } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import ActionItem from './ActionItem';

const Wrapper = React.forwardRef((props, ref) => {
  const {
    isDraggingOver,
    ...divProps
  } = props;
  return (
    <div
      {...divProps}
      ref={ref}
      style={{
        ...props.style,
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none',
        transition: 'background-color 0.1s ease',
      }}
    />
  );
});

const DropZone = React.forwardRef((props, ref) => (
  <div
    {...props}
    ref={ref}
    style={{
      ...props.style,
      display: 'flex',
      alignItems: 'start',
      // minWidth: 600,
      height: 48,
    }}
  />
));

const ScrollContainer = props => (
  <div
    {...props}
    style={{
      ...props.style,
      overflow: 'auto',
    }}
  />
);

export default class ActionList extends Component {
  renderBoard = (dropProvided) => {
    const { actions } = this.props;

    // console.log('dropProvided.placeholder :', dropProvided.placeholder);
    return (
      <DropZone ref={dropProvided.innerRef}>
        {actions.map((action, index) => (
          <Draggable key={action.id} draggableId={action.id} index={index}>
            {(
              dragProvided,
              dragSnapshot,
            ) => (
              <ActionItem
                action={action.action}
                provided={dragProvided}
                snapshot={dragSnapshot}
                isGroupedOver={Boolean(dragSnapshot.combineTargetFor)}
              />
            )}
          </Draggable>
        ))}
        <div style={{ display: 'none' }}>
          {dropProvided.placeholder}
        </div>
      </DropZone>
    );
  };

  render() {
    const {
      listId, listType, isCombineEnabled,
    } = this.props;

    return (
      <Droppable
        droppableId={listId}
        type={listType}
        direction="horizontal"
        isCombineEnabled={isCombineEnabled}
      >
        {(
          dropProvided,
          dropSnapshot,
        ) => (
          <Wrapper
            isDraggingOver={dropSnapshot.isDraggingOver}
            {...dropProvided.droppableProps}
          >
            <ScrollContainer>
              {this.renderBoard(dropProvided)}
            </ScrollContainer>
          </Wrapper>
        )}
      </Droppable>
    );
  }
}
