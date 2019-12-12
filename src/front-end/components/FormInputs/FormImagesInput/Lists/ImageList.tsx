// @flow
import React, { useContext } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import uploadContext, { ImageInfo, ObservableInfo } from '~/components/FormInputs/FormImagesInput/uploadContext';
import ImageItem from './ImageItem';

const Wrapper = React.forwardRef<any, any>((props, ref) => {
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

const DropZone = React.forwardRef<any, any>((props, ref) => {
  const { thumbSize, ...divProps } = props;
  return (
    <div
      {...divProps}
      ref={ref}
      style={{
        ...props.style,
        display: 'flex',
        alignItems: 'start',
        minWidth: 200,
        minHeight: thumbSize || 48,
      }}
    />
  );
});

const ScrollContainer = props => (
  <div
    {...props}
    style={{
      ...props.style,
      overflow: 'auto',
    }}
  />
);

const Container = props => (
  <div
    {...props}
    style={{
      ...props.style,
      flexGrow: 1,
      display: 'inline-flex',
    }}
  />
);

export default (props) => {
  const {
    listId,
    listType,
    imageInfos,
    thumbSize,
    onItemClick = () => {},
  } = props;

  const context = useContext(uploadContext);

  const handleItemClick = (imageInfo, index) => () => {
    onItemClick(imageInfo, index);
  };

  const renderBoard = dropProvided => (
    <Container>
      <DropZone
        ref={dropProvided.innerRef}
        thumbSize={thumbSize}
      >
        {imageInfos.map((imageInfo, index) => (
          <Draggable key={imageInfo.id} draggableId={imageInfo.id} index={index}>
            {(
              dragProvided,
              dragSnapshot,
            ) => (
              <ImageItem
                imageInfo={imageInfo}
                provided={dragProvided}
                snapshot={dragSnapshot}
                thumbSize={thumbSize}
                onClick={handleItemClick(imageInfo, index)}
                observableInfo={context.getObservableInfo(imageInfo.image.hash!)}
              />
            )}
          </Draggable>
        ))}
        {dropProvided.placeholder}
      </DropZone>
    </Container>
  );

  return (
    <Droppable
      droppableId={listId}
      type={listType}
      direction="horizontal"
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
            {renderBoard(dropProvided)}
          </ScrollContainer>
        </Wrapper>
      )}
    </Droppable>
  );
}
