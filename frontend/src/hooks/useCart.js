import { useState } from 'react';
import { useClienteAuth } from './useClienteAuth';

export function useCart() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const clienteAuth = useClienteAuth();

  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        if (exists.cantidad >= product.stock) {
          return prev;
        }
        return prev.map(item => item.id === product.id ? { ...item, cantidad: item.cantidad + 1 } : item);
      }
      return [...prev, { ...product, cantidad: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id, amount) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.cantidad + amount;
        if (amount > 0 && newQty > item.stock) {
          return item;
        }
        return newQty > 0 ? { ...item, cantidad: newQty } : item;
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCart([]);
  };

  const handleReorder = (orderProducts, products) => {
    setCart(prev => {
      let updatedCart = [...prev];
      orderProducts.forEach(prod => {
        const originalProduct = products.find(p => p.nombre.toLowerCase() === prod.nombre.toLowerCase());
        if (originalProduct) {
          const exists = updatedCart.find(item => item.id === originalProduct.id);
          if (exists) {
            updatedCart = updatedCart.map(item => 
              item.id === originalProduct.id 
                ? { ...item, cantidad: item.cantidad + prod.cantidad } 
                : item
            );
          } else {
            updatedCart.push({ ...originalProduct, cantidad: prod.cantidad });
          }
        }
      });
      return updatedCart;
    });
    setIsCartOpen(true);
  };

  const totalCartPrice = cart.reduce((acc, item) => acc + (Number(item.precio) * item.cantidad), 0);
  const totalCartItems = cart.reduce((acc, item) => acc + item.cantidad, 0);

  return {
    cart,
    setCart,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    handleReorder,
    totalCartPrice,
    totalCartItems,
    clienteAuth
  };
}
