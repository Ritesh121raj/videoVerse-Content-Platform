import { Play } from "lucide-react";

function Shorts() {
  const shorts = [
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&h=800&fit=crop",
      title: "C++ Trick You Should Know",
      views: "2.4M",
    },

    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&h=800&fit=crop",
      title: "React in 30 Seconds",
      views: "1.8M",
    },

    {
      id: 3,
      image:
        "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=500&h=800&fit=crop",
      title: "DSA Interview Trick",
      views: "950K",
    },

    {
      id: 4,
      image:
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&h=800&fit=crop",
      title: "JavaScript Amazing Trick",
      views: "3.2M",
    },

    {
      id: 5,
      image:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&h=800&fit=crop",
      title: "Learn Coding Faster",
      views: "720K",
    },
  ];

  return (
    <section className="shorts-section">

      <div className="shorts-heading">
        <Play size={24} fill="currentColor" />
        <h2>Shorts</h2>
      </div>

      <div className="shorts-container">

        {shorts.map((short) => (
          <div
            className="short-card"
            key={short.id}
          >

            <img
              src={short.image}
              alt={short.title}
            />

            <div className="short-info">

              <h3>{short.title}</h3>

              <p>{short.views} views</p>

            </div>

          </div>
        ))}

      </div>

    </section>
  );
}

export default Shorts;