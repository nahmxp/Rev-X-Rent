import Link from 'next/link';
import { useRouter } from 'next/router';

export default function ProductCard({ product, isAdmin }) {
  const router = useRouter();

  const handleBuy = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    router.push({
      pathname: '/checkout',
      query: {
        productId: product._id,
        productName: product.name,
        price: product.price,
        image: product.image,
        fromSingle: 'true'
      }
    });
  };

  const handleRent = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    router.push({
      pathname: '/checkout',
      query: {
        productId: product._id,
        productName: product.name,
        price: product.price,
        image: product.image,
        fromSingle: 'true',
        isRental: 'true',
        rentalPrices: JSON.stringify({
          hourly: product.rentalPrice?.hourly || 0,
          daily: product.rentalPrice?.daily || 0
        })
      }
    });
  };

  return (
    <div className="product-card">
      <Link href={`/product/${product._id}`}>
        <div className="product-card-content">
          {product.category && (
            <div className="product-category-tag">
              {product.category}
            </div>
          )}
          <div className="product-image-container">
            <img 
              src={product.image || 'https://via.placeholder.com/150'} 
              alt={product.name}
              className="product-image"
            />
          </div>
          <div className="product-info">
            <h3 className="product-name">{product.name}</h3>
            <p className="product-brand">{product.brand}</p>
            <p className="product-price">${product.price}</p>
            {product.isRentable && (
              <div className="rental-info">
                {product.rentalPrice?.hourly > 0 && (
                  <p className="rental-price">
                    <span className="rental-label">Hourly:</span> 
                    <span className="rental-value">${product.rentalPrice.hourly}</span>
                  </p>
                )}
                {product.rentalPrice?.daily > 0 && (
                  <p className="rental-price">
                    <span className="rental-label">Daily:</span>
                    <span className="rental-value">${product.rentalPrice.daily}</span>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>

      <div className="product-card-actions">
        <button className="buy-button" onClick={handleBuy}>
          Buy Now
        </button>
        {product.isRentable && (
          <button className="rent-button" onClick={handleRent}>
            Rent
          </button>
        )}
        
        {isAdmin && (
          <>
            <Link href={`/update-product/${product._id}`}>
              <button className="btn-edit">Edit</button>
            </Link>
            <Link href={`/product/${product._id}?action=delete`}>
              <button className="btn-delete">Delete</button>
            </Link>
          </>
        )}
      </div>

      <style jsx>{`
        .rental-info {
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px dashed var(--border-color);
        }
        
        .rental-price {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 5px 0;
          font-size: 0.9em;
          color: var(--text-color);
        }
        
        .rental-label {
          color: var(--rent-color);
          font-weight: 500;
        }
        
        .rental-value {
          font-weight: 600;
        }
      `}</style>
    </div>
  );
} 