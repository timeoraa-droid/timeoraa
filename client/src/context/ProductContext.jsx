import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE } from '../config/api';

const ProductContext = createContext();

const API_URL = `${API_BASE}/products`;
const normalizeProduct = (product) => ({
  ...product,
  id: product.id || product._id || product.sku,
  _id: product._id || product.id || product.sku,
  category: product.categoryName || (typeof product.category === 'string' ? product.category : ''),
});

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(API_URL, { timeout: 10000 });
      const records = Array.isArray(res.data?.products) ? res.data.products : [];
      setProducts(records.map(product => ({
        ...product,
        id: product.id || product._id || product.sku,
        _id: product._id || product.id || product.sku,
        category: product.categoryName || (typeof product.category === 'string' ? product.category : ''),
      })));
    } catch (requestError) {
      setProducts([]);
      setError(requestError.response?.data?.message || 'The live catalog could not be reached. Please try again shortly.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    axios.get(API_URL, { timeout: 10000 })
      .then(response => {
        const records = Array.isArray(response.data?.products) ? response.data.products : [];
        if (active) setProducts(records.map(normalizeProduct));
      })
      .catch(requestError => {
        if (active) {
          setProducts([]);
          setError(requestError.response?.data?.message || 'The live catalog could not be reached. Please try again shortly.');
        }
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const addProduct = async (data) => {
    const formatted = {
      name: data.name?.trim(),
      brand: 'TIMEORA', price: Number(data.price),
      discountPrice: data.discountPrice || null, category: data.category || 'Chronograph',
      gender: data.gender || 'Unisex', stock: Number(data.stock) >= 0 ? Number(data.stock) : 10,
      sku: data.sku || `TM-${Math.floor(1000 + Math.random() * 9000)}`,
      images: data.images || [data.image || ''], video: data.video || '',
      rating: 5.0, reviewsCount: 1,
    };
    try {
      const token = localStorage.getItem('timeora_token');
      const response = await axios.post(API_URL, formatted, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      const product = normalizeProduct(response.data.product);
      setProducts(prev => [product, ...prev]);
      return product;
    } catch (requestError) {
      throw new Error(requestError.response?.data?.message || 'Product could not be saved to the live catalog.');
    }
  };

  const updateProduct = async (id, updates) => {
    try {
      const token = localStorage.getItem('timeora_token');
      const response = await axios.put(`${API_URL}/${id}`, updates, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      const product = normalizeProduct(response.data.product);
      setProducts(prev => prev.map(item => item.id === id || item.sku === id ? product : item));
      return product;
    } catch (requestError) {
      throw new Error(requestError.response?.data?.message || 'Product changes could not be saved to the live catalog.');
    }
  };

  const deleteProduct = async (id) => {
    try {
      const token = localStorage.getItem('timeora_token');
      await axios.delete(`${API_URL}/${id}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      setProducts(prev => prev.filter(item => item.id !== id && item.sku !== id));
    } catch (requestError) {
      throw new Error(requestError.response?.data?.message || 'Product could not be removed from the live catalog.');
    }
  };

  const markOutOfStock = async (id) => updateProduct(id, { stock: 0 });
  const markAvailable = async (id, qty) => {
    const stock = Number(qty);
    if (!Number.isInteger(stock) || stock < 1) throw new Error('Enter the verified stock quantity before marking this product available.');
    return updateProduct(id, { stock });
  };
  const setProductOffer = async (id, price) => updateProduct(id, { discountPrice: Number(price) });
  const removeProductOffer = async (id) => updateProduct(id, { discountPrice: null });
  const getProductById = (id) => products.find(p => String(p.id) === String(id));

  return (
    <ProductContext.Provider value={{
      products, loading, error, refreshProducts, addProduct, updateProduct, deleteProduct,
      markOutOfStock, markAvailable, setProductOffer, removeProductOffer,
      getProductById,
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);
