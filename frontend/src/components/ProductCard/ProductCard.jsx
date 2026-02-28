import React from "react";
import './ProductCard.scss';
import watchImg from '../../assets/smartwatch.jpg';

function ProductCard(){
    return (
        <div className="card">
            <div className="card__image-container">
                <img
                className="card__image"
                src={watchImg}
                alt="Умные часы"
                />
            </div>
            <div className="card__content">
                <h2 className="card__title">Умные часы Apple Watch</h2>
                <p className="card__description">
                    Стильные и современные умные часы с функцией отслеживания активности и пульсометром
                </p>
                <button className="card__button">
                    Добавить в корзину
                </button>
            </div>
        </div>
    )
}

export default ProductCard;