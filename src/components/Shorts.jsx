import { Play } from "lucide-react";

function Shorts() {

  const shorts = [
    {
      id: 1,
      image: "https://picsum.photos/250/400?random=21",
      title: "C++ Trick You Should Know",
      views: "2.4M",
    },

    {
      id: 2,
      image: "https://picsum.photos/250/400?random=22",
      title: "React in 30 Seconds",
      views: "1.8M",
    },

    {
      id: 3,
      image: "https://picsum.photos/250/400?random=23",
      title: "DSA Interview Trick",
      views: "950K",
    },

    {
      id: 4,
      image: "https://picsum.photos/250/400?random=24",
      title: "JavaScript Amazing Trick",
      views: "3.2M",
    },

    {
      id: 5,
      image: "https://picsum.photos/250/400?random=25",
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

              <h3>
                {short.title}
              </h3>

              <p>
                {short.views} views
              </p>

            </div>

          </div>

        ))}

      </div>

    </section>

  );
}

export default Shorts;