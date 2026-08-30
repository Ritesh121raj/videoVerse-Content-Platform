import VideoCard from "./VideoCard";

function VideoGrid({ videos }) {
  return (
    <div className="video-grid">

      {videos.length > 0 ? (

        videos.map((video) => (
          <VideoCard
            key={video.id}
            id={video.id}
            image={video.image}
            title={video.title}
            channel={video.channel}
            views={video.views}
            time={video.time}
          />
        ))

      ) : (

        <h2>No videos found 😔</h2>

      )}

    </div>
  );
}

export default VideoGrid;