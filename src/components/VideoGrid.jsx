import VideoCard from "./VideoCard";

function VideoGrid({ videos }) {
  return (
    <div className="video-grid">
      {videos.map((video) => (
        <VideoCard
          key={video.id}
          id={video.id}
          image={video.image}
          title={video.title}
          channel={video.channel}
          views={video.views}
          time={video.time}
          duration={video.duration}
        />
      ))}
    </div>
  );
}

export default VideoGrid;