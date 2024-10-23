// src/components/ProductListing.js
import React from 'react';
import './ProductListing.css'; // Optional: Add CSS for styling

const products = [
  {
    id: 1,
    name: 'Guitar 1',
    description: 'a very good guitar',
    price: '$10',
    imageUrl: 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcRT9TIkCxQF_gaEznyzYq4TYU5yvuiz41lRL4A37twt_ccxm0y-NHPsEJmG0YKN_3yr4rB3DAjDB5v706NuM8RvHyFCafmw65njoBMxBos&usqp=CAE', // Replace with actual image URL
  },
  {
    id: 2,
    name: 'Guitar 2',
    description: ' an even better guitar',
    price: '$20',
    imageUrl: 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcTYYnPz2fkCq4DIUkzhJC0EaveAQK1zNcRhK1UckE1zkZQjwNgs4oX1z1o3AAPagn6O8rrKP0fQ1tN40JgfqrSz9ea4par4fBJMXRIEHzwtTmFpi5gdZc1H&usqp=CAE', // Replace with actual image URL
  },
  {
    id: 3,
    name: 'Piano 1',
    description: 'a very good piano',
    price: '$30',
    imageUrl: 'https://www.lastvoice.com.tr/uploads/urunler/midex-plx-140-pro-sr-dijital-piyano-bluetooth-tus-hassasiyeti-88-tuslu-kapakli-kulaklik-ve-tabure-8163.jpg', // Replace with actual image URL
  },
  {
    id: 4,
    name: 'Piano 2',
    description: 'an even better piano',
    price: '$50',
    imageUrl: 'https://m.media-amazon.com/images/I/51ogYTXJqAL._AC_SY879_.jpg', // Replace with actual image URL
  },
  {
    id: 5,
    name: 'Drums 1',
    description: 'cool drums set',
    price: '$60',
    imageUrl: 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcShK8sXaRXnnIVvCu1dOxpQWOJRGtY9Ezhkk7Jaddg54uNzpDyJCdbOZQRak9McPBpzGVTWjwa5ekkwit_R-nZQHdPNQwfT&usqp=CAY', // Replace with actual image URL
  },
  {
    id: 6,
    name: 'Drums 2',
    description: ' an even better drums set',
    price: '$70',
    imageUrl: 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQ5-NR_IhakZPaxoWW5eXCX5ZjAgzX-xOjg5nVqCMgJZHngKAmhkKTFwQjHRaaW1ltKp1f5yniNiDZhK_vLbbUVGYgKCLq7bvxGf2oUM9k31V0MJLseShTQ&usqp=CAE', // Replace with actual image URL
  },
  {
    id: 7,
    name: 'Clarinet 1',
    description: 'squidward ',
    price: '$50',
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRD8GNGnRrpXGBsbZz0qyLb7zJmcCazNZ5sZQ&s', // Replace with actual image URL
  },
];

const ProductListing = () => {
  return (
    <div className="product-listing">
      <h2>Product Listing</h2>
      <div className="product-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <img src={product.imageUrl} alt={product.name} />
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p className="price">{product.price}</p>
            <button className="product-btn">Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductListing;
