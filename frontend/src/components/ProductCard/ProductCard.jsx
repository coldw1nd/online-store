import React from "react";
import './ProductCard.scss';
import watchImg from '../../assets/smartwatch.jpg';

function ProductCard({ product, onDelete }) {
    return (
        <div className="card">
            <div className="card__image-container">
                <img
                    className="card__image"
                    src={watchImg}
                    alt={product.name}
                />
            </div>
            <div className="card__content">
                <h2 className="card__title">{product.name}</h2>
                <p className="card__description">{product.description}</p>
                <p className="card__price">{product.price} руб.</p>
                
                <button className="card__button">
                    В корзину
                </button>
                <button className="card__button card__button--danger" onClick={() => onDelete(product.id)}>
                    Удалить
                </button>
            </div>
        </div>
    )
}

export default ProductCard;