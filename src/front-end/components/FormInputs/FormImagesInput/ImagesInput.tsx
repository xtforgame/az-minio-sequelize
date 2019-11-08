// @flow
import React, { useState, useContext } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import uuidv4 from 'uuid/v4';
// import ActionList from './Lists/ActionList';
import uploadContext, { ImageInfo, HandleUpload, Context } from '~/components/FormInputs/FormImagesInput/uploadContext';
import { ProcessFileResult } from '~/utils/imageHelpers';
import useForceUpdate from '~/hooks/useForceUpdate';
import ImageList from './Lists/ImageList';
import DetailButton from './DetailButton';
import AddImageButton from './AddImageButton';
import { arrayMove } from './array-helpers';

const Root = props => (
  <div
    {...props}
    style={{
      ...props.style,
      display: 'flex',
      flexDirection: 'column',
    }}
  />
);

const ActionRoot = props => (
  <div
    {...props}
    style={{
      ...props.style,
      display: 'flex',
    }}
  />
);

const actions = 'actions';
const images = 'images';

const quoteMap = {
  [actions]: [
    {
      id: 'action-info',
      content: 'action-info',
      action: {
        id: 'action-info',
        imgUrl: 'xxx',
        name: 'action-info',
      },
    },
  ],
  [images]: [
    {
      id: 'image-rocket1',
      content: 'Jake',
      image: {
        id: 'image-rocket1',
        imgUrl: 'https://d8ai.atlassian.net/secure/projectavatar?pid=10037&avatarId=10419&size=xxlarge',
        name: 'image-rocket1',
      },
    },
    {
      id: 'image-rocket2',
      content: 'Jake',
      image: {
        id: 'image-rocket2',
        imgUrl: 'https://d8ai.atlassian.net/secure/projectavatar?pid=10037&avatarId=10419&size=xxlarge',
        name: 'image-rocket2',
      },
    },
  ],
};

export type OnAddImageInfo = (
  imageInfo : ImageInfo,
  options : {
    context : Context;
  },
) => any;

export type OnEditImageInfo = (
  imageInfo : ImageInfo,
  index : number,
  options : {
    context : Context;
  },
) => any;

export type GetContent = (
  imageInfo : ImageInfo,
  index : number,
) => any;

type Props = {
  id: string,
  value?: ImageInfo[];
  onChange : Function;
  onAdd : OnAddImageInfo;
  onEdit?: OnEditImageInfo;
  getContent?: GetContent;
  thumbSize : number;
  handleUpload : HandleUpload,
  lightboxZIndex?: number;
};

export default (props : Props) => {
  /* eslint-disable react/sort-comp */

  const {
    id,
    value: imageInfos = [],
    onChange: setImageInfos,
    onAdd: addImageInfo,
    onEdit,
    getContent,
    thumbSize = 48,
    handleUpload,
    lightboxZIndex,
  } = props;
  const context = useContext(uploadContext);
  const [index, setIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const forceUpdate = useForceUpdate();

  const onDragEnd = (result) => {
    // // dropped outside the list
    if (!result.destination || result.source.droppableId !== result.destination.droppableId) {
      return;
    }

    setImageInfos(arrayMove(
      imageInfos,
      result.source.index,
      result.destination.index,
    ));
  };

  const newContext : any = {
    ...context,
    uploadImage: (imageInfo : ImageInfo) => {
      context.uploadImage(imageInfo, handleUpload);
      forceUpdate();
    },
  };

  const editFunction = onEdit ? (index) => {
    onEdit(imageInfos[index], index, { context: newContext });
  } : undefined;

  return (
    <DragDropContext
      onDragEnd={onDragEnd}
    >
      <uploadContext.Provider
        value={newContext}
      >
        <Root>
          <ActionRoot>
            {/* <ActionList
              internalScroll
              isCombineEnabled
              listId={actions}
              listType="CARD"
              actions={stateActions}
            /> */}
            <DetailButton
              imageInfos={imageInfos}
              index={index}
              setIndex={setIndex}
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              editByIndex={editFunction}
              getContent={getContent}
              deleteByIndex={(index) => {
                const newImageInfos = [...imageInfos];
                newImageInfos.splice(index, 1);
                setImageInfos(newImageInfos);
              }}
              zIndex={lightboxZIndex}
            />
            <AddImageButton
              id={id ? `${id}-add-image-button` : 'add-image-button'}
              onLoadEnd={(imageUploadInfo: ProcessFileResult) => {
                const id = uuidv4();
                const imageInfo = {
                  id,
                  imageUploadInfo,
                  content: imageUploadInfo.fileName,
                  image: {
                    id,
                    imgUrl: imageUploadInfo.dataURL,
                    hash: imageUploadInfo.hash || '',
                    name: imageUploadInfo.fileName,
                    metadata: {},
                  },
                };
                addImageInfo(imageInfo, { context: newContext });
              }}
            />
          </ActionRoot>
          <ImageList
            internalScroll
            listId={images}
            listType="CARD"
            imageInfos={imageInfos}
            thumbSize={thumbSize}
            onItemClick={(imageInfo, imageIndex) => {
              setIndex(imageIndex);
              setIsOpen(true);
            }}
          />
        </Root>
      </uploadContext.Provider>
    </DragDropContext>
  );
}
