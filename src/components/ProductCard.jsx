import { Link } from "react-router-dom";

function ProductCard({ product, onAddToCart }) {
  const isOutOfStock = product.stockQuantity <= 0;

  return (
    <article className="product-card">
      <Link to={`/products/${product.id}`} className="product-image-link">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="product-image"
          />
        ) : (
          <div className="product-image-placeholder">
            No Image
          </div>
        )}
      </Link>

      <div className="product-content">
        <p className="product-category">
          {product.categoryName || "Uncategorized"}
        </p>

        <h3 className="product-name">
          <Link to={`/products/${product.id}`}>
            {product.name}
          </Link>
        </h3>

        <p className="product-price">
          ₹{product.price}
        </p>

        {isOutOfStock ? (
          <div className="out-of-stock">Out of Stock</div>
        ) : (
          <p className="stock-available">
            {product.stockQuantity} item(s) available
          </p>
        )}

        <button
          className="add-cart-button"
          disabled={isOutOfStock}
          onClick={() => onAddToCart(product)}
        >
          {isOutOfStock ? "Unavailable" : "Add to Cart"}
        </button>
      </div>
    </article>
  );
}

export default ProductCard;