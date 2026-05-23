import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./BannerCarousel.css";

export default function BannerCarousel({ banners }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!banners?.length) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % banners.length);
    }, 5000);
    return () => clearInterval(t);
  }, [banners]);

  if (!banners?.length) return null;

  const banner = banners[index];

  return (
    <section className="banner-carousel">
      <div className="banner-carousel__slide" style={{ backgroundImage: `url(${banner.image})` }}>
        <div className="container banner-carousel__content">
          <h2>{banner.title}</h2>
          <p>{banner.subtitle}</p>
          <Link to={banner.link} className="btn btn--primary">
            {banner.cta}
          </Link>
        </div>
      </div>
      <div className="banner-carousel__dots">
        {banners.map((_, i) => (
          <button
            key={i}
            type="button"
            className={i === index ? "active" : ""}
            onClick={() => setIndex(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
