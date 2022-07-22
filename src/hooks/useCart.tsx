import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart')

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });


  const addProduct = async (productId: number) => {
    try {
      const productInCart = cart.find(product => product.id === productId)
      if(productInCart) {
        await updateProductAmount({ productId, amount: productInCart.amount + 1 })
        return
      }

      const { data } = await api.get(`products/${productId}`)
      const products = [...cart, { ...data, amount: 1 }]
      setCart(products)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(products))
    } catch {
      toast("Não foi possível adicionar produto ao carrinho")
    } finally {
      toast("Produto adicionado com sucesso")
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const products = cart.filter(product => product.id !== productId)
      setCart(products)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(products))
      toast("Produto removido com sucesso!")
    } catch {
      toast("Não foi possível remover produto ao carrinho")
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const products = cart.map(product => {
        if(product.id === productId) {
          return { ...product, amount }
        }
        return product
      })
      setCart(products)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(products))
    } catch {
      toast("Não foi possível atualizar carrinho")
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
