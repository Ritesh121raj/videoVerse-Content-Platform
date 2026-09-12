import VideoCard from "./VideoCard";

function VideoGrid({ videos }) {
  return (
    <div className="video-grid">
      {videos.map((video) => (
        <VideoCard
          key={video.id}
          id={video.id}

          // Support both old local data and YouTube API data
          image={video.image || video.thumbnail}
          thumbnail={video.thumbnail || video.image}

          title={video.title}
          channel={video.channel}
          channelImage={video.channelImage}

          views={video.views}

          time={video.time || video.publishedAt}
          publishedAt={video.publishedAt || video.time}

          duration={video.duration}
        />
      ))}
    </div>
  );
}

export default VideoGrid;