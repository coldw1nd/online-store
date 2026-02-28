import React from 'react'
import ProductCard from './components/ProductCard/ProductCard';

function App(){
  return (
    <div style={{
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      padding: '50px', 
      backgroundColor: '#f0f2f5', 
      minHeight: '100vh'}}>
      <h1 style={{marginBottom: '30px', color: '#333', fontFamily: 'Arial'}}>
        Мой интернет магазин
      </h1>
      <ProductCard/>
    </div>
  );
}

export default App;