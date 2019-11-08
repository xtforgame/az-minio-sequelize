// @flow
import React, { useState, useEffect, useRef, useContext } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import CardMedia from '@material-ui/core/CardMedia';
import Zoom from '@material-ui/core/Zoom';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import CloudDoneIcon from '@material-ui/icons/CloudDone';
import { ImageInfo, ObservableInfo } from '~/components/FormInputs/FormImagesInput/uploadContext';

const useStyles = makeStyles(theme => ({
  root: {
    // width: 50,
    // height: 50,
    flexGrow: 0,
    flexShrink: 0,
    borderRadius: 8,
    // margin: 4,
    position: 'relative',
  },
  mask: {
    position: 'absolute',
    // borderRadius: 8,
    // borderStyle: 'solid',
    // borderWidth: 2,
    // borderColor: 'transparent',
    width: '100%',
    top: 0,
    left: 0,
    pointerEvents: 'none',
    background: 'rgba(0, 0, 0, 0.5)',
  },
  stateIcon: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
}));

export type Props = {
  imageInfo: ImageInfo;
  isDragging: boolean;
  thumbSize?: number;
  onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  observableInfo?: ObservableInfo;
};

const Avatar = React.forwardRef<any, Props>((props, ref) => {
  const {
    imageInfo,
    isDragging,
    thumbSize = 48,
    onClick,
    observableInfo,
    ...divProps
  } = props;
  // console.log('imageInfo :', imageInfo);
  // console.log('context :', context);

  const classes = useStyles();
  const theme = useTheme();

  const [uploadDone, setUploadDone] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (observableInfo && imageInfo.imageUploadInfo) {
      observableInfo.uploadProgressSubject.getValue()
      const subscription = observableInfo.uploadProgressSubject.subscribe((value) => {
        setUploadProgress(Math.min(value, 100));
        if (value >= 100) {
          setUploadDone(true);
        }
      });
      return () => {
        if (subscription) {
          subscription.unsubscribe();
        }
      };
    }
  }, [observableInfo, imageInfo.imageUploadInfo]);

  const transitionDuration = {
    enter: theme.transitions.duration.enteringScreen,
    exit: theme.transitions.duration.leavingScreen,
  };

  const renderStateIcon = () => {
    if (imageInfo.imageUploadInfo) {
      return (
        <React.Fragment>
          <div className={classes.stateIcon}>
            <Zoom
              in={!uploadDone}
              timeout={transitionDuration}
              style={{
                transitionDelay: `${!uploadDone ? transitionDuration.exit : 0}ms`,
              }}
              unmountOnExit
            >
              <CloudUploadIcon color="secondary" />
            </Zoom>
          </div>
          <div className={classes.stateIcon}>
            <Zoom
              in={uploadDone}
              timeout={transitionDuration}
              style={{
                transitionDelay: `${uploadDone ? transitionDuration.exit : 0}ms`,
              }}
              unmountOnExit
            >
              <CloudDoneIcon color="primary" />
            </Zoom>
          </div>
        </React.Fragment>
      );
    }
    return (
      <div className={classes.stateIcon}>
        <CloudDoneIcon color="primary" />
      </div>
    );
  };

  return (
    <div
      {...divProps}
      ref={ref}
      className={classes.root}
    >
      <CardMedia
        style={{
          position: 'relative',
          overflow: 'hidden',
          width: thumbSize,
          height: thumbSize,
          borderRadius: 8,
          borderStyle: 'solid',
          borderWidth: 2,
          borderColor: props.isDragging ? 'green' : 'white',
          opacity: props.isDragging ? 0.3 : 1,
        }}
        image={imageInfo.image.imgUrl}
        title={imageInfo.content || ''}
        onClick={onClick}
      >
        {!!imageInfo.imageUploadInfo && (
          <div
            className={classes.mask}
            style={{
              height: `${100 - uploadProgress}%`,
            }}
          />
        )}
      </CardMedia>
      {renderStateIcon()}
    </div>
  );
});

export default (props) => {
  const {
    imageInfo,
    provided,
    snapshot,
    thumbSize,
    onClick,
    observableInfo,
  } = props;

  return (
    <Avatar
      ref={ref => provided.innerRef(ref)}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      imageInfo={imageInfo}
      isDragging={snapshot.isDragging}
      thumbSize={thumbSize}
      onClick={onClick}
      observableInfo={observableInfo}
    />
  );
};
