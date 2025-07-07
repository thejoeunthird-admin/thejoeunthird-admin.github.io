import React, { useState, useEffect } from "react";
import "../css/product.css";
import noImg from '../public/noImg.png'

export function CustomCarousel({ images = [''], getImages }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const prevImage = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const nextImage = () => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const selectImage = (index) => {
        setCurrentIndex(index);
    };

    console.log(images[0] === '')
    return (
        <div className="custom-carousel">
            <button onClick={prevImage} className="nav-btn prev-btn">◀</button>

            <div className="carousel-image-wrapper">
                <img
                    src={images[0] === ''?noImg :getImages(images[currentIndex])}
                    alt={`Slide ${currentIndex + 1}`}
                    className="carousel-image"
                />
            </div>

            <button onClick={nextImage} className="nav-btn next-btn">▶</button>

            <div className="carousel-indicators">
                {images.map((_, index) => (
                    <button
                        key={index}
                        className={`indicator-dot ${index === currentIndex ? 'active' : ''}`}
                        onClick={() => selectImage(index)}
                    />
                ))}
            </div>
        </div>
    );
}
