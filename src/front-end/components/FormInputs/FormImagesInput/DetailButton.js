
/* eslint-disable jsx-a11y/label-has-associated-control, no-underscore-dangle */
/* eslint-disable react/prop-types, react/forbid-prop-types, jsx-a11y/label-has-associated-control */
import React from 'react';
import Lightbox from 'react-image-lightbox';
import { makeStyles } from '@material-ui/core/styles';
import Fab from '@material-ui/core/Fab';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import FullscreenIcon from '@material-ui/icons/Fullscreen';

const onImageLoadError = (imageSrc, _srcType, errorEvent) => {
  console.error(`Could not load image at ${imageSrc}`, errorEvent); // eslint-disable-line no-console
};

const useStyles = makeStyles(theme => ({
  fab: {
    boxShadow: 'none',
  },
}));

export default (props) => {
  const {
    imageInfos = [],
    index = 0,
    setIndex,
    isOpen = false,
    setIsOpen,
    getContent: getContentFunc,
    editByIndex,
    deleteByIndex,
    zIndex,
  } = props;
  const classes = useStyles();
  // console.log('imageInfos :', imageInfos);

  // const [isOpen, setIsOpen] = useState(false);

  const openLightbox = () => {
    setIsOpen(true);
  };

  const closeLightbox = () => {
    setIsOpen(false);
    setIndex(0);
  };

  const moveNext = () => {
    setIndex((index + 1) % imageInfos.length);
  };

  const movePrev = () => {
    setIndex((index + imageInfos.length - 1) % imageInfos.length);
  };

  const getUrl = imageInfo => (imageInfo && imageInfo.image && imageInfo.image.imgUrl) || '';
  const getContent = getContentFunc || (imageInfo => (imageInfo && imageInfo.content) || '');

  let lightbox;
  if (isOpen && imageInfos.length) {
    const content = getContent(imageInfos[index], index);
    const editButtons = editByIndex ? [
      (
        <button
          type="button"
          aria-label="Zoom in"
          className="ril__toolbarItemChild ril__builtinButton"
          style={{
            paddingTop: 6,
            backgroundColor: 'transparent',
          }}
          onClick={() => {
            editByIndex(index);
          }}
        >
          <EditIcon color="primary" />
        </button>
      ),
    ] : [];
    lightbox = (
      <Lightbox
        mainSrc={getUrl(imageInfos[index])}
        nextSrc={getUrl(imageInfos[(index + 1) % imageInfos.length])}
        prevSrc={
          getUrl(imageInfos[(index + imageInfos.length - 1) % imageInfos.length])
        }
        mainSrcThumbnail={getUrl(imageInfos[index])}
        nextSrcThumbnail={getUrl(imageInfos[(index + 1) % imageInfos.length])}
        prevSrcThumbnail={
          getUrl(imageInfos[(index + imageInfos.length - 1) % imageInfos.length])
        }
        onCloseRequest={closeLightbox}
        onMovePrevRequest={movePrev}
        onMoveNextRequest={moveNext}
        onImageLoadError={onImageLoadError}
        imageTitle={`(${index + 1}/${imageInfos.length})`}
        imageCaption={content}
        reactModalStyle={{ overlay: { zIndex: zIndex || 1300 } }}
        toolbarButtons={[
          ...editButtons,
          (
            <button
              type="button"
              aria-label="Zoom in"
              className="ril__toolbarItemChild ril__builtinButton"
              style={{
                paddingTop: 6,
                backgroundColor: 'transparent',
              }}
              onClick={() => {
                if (imageInfos.length <= 1) {
                  closeLightbox();
                } else if (index === imageInfos.length - 1) {
                  setIndex(index - 1);
                }
                deleteByIndex(index);
              }}
            >
              <DeleteIcon color="error" />
            </button>
          ),
        ]}
      />
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        width: 48,
        height: 48,
        padding: 4,
        marginRight: 8,
      }}
    >
      <Fab
        component="span"
        size="small"
        color="primary"
        aria-label="add"
        className={classes.fab}
        onClick={openLightbox}
        disabled={!imageInfos.length}
      >
        <FullscreenIcon />
      </Fab>
      {lightbox}
    </div>
  );
};
