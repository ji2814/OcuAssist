import clsx from 'clsx';
import  ImageManager from './ImageManager';


type Props = {
  className?: string;
};

const ThumbnailPanel = (props: Props) => {
  return (
    <div
      className={clsx(
        'bg-white rounded-lg shadow flex flex-col h-full overflow-hidden',
        props.className
      )}
    >
      <ImageManager />
    </div>
  );
};

export default ThumbnailPanel;