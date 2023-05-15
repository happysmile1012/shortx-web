import { createContext, createElement, useContext, useEffect, useRef, useState } from "react";

// TODO - Expand LocalEpochContext to support additional logic
// TODO - Add price
interface LocalEpochContextValue {
  epochIndex: number;
  setEpochIndex: React.Dispatch<React.SetStateAction<number>>;
  incrementEpochIndex: () => void;

  price: number;
  setPrice: React.Dispatch<React.SetStateAction<number>>;
  updatePrice: (newPrice: number) => void;

  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  updateBalance: (newBalance: number) => void;
}

const LocalEpochContext = createContext<LocalEpochContextValue>({
  epochIndex: 0,
  setEpochIndex: () => {},
  incrementEpochIndex: () => {},

  price: 0,
  setPrice: () => {},
  updatePrice: (newPrice) => {},

  balance: 0,
  setBalance: () => {},
  updateBalance: (newBalance) => {},
});

type LocalEpochProviderProps = {
  children: React.ReactNode;
};

export const LocalEpochProvider = ({ children }: LocalEpochProviderProps) => {    
  const [epochIndex, setEpochIndex] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [balance, setBalance] = useState<number>(0);

  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current) {
      // Load epoch, price, and other data from local even if not used
      const cachedIndex = parseInt(localStorage.getItem("epochIndex") || "0");
      const cachedPrice = parseInt(localStorage.getItem("price") || "0");
      const cachedBalance = parseInt(localStorage.getItem("balance") || "0");

      setEpochIndex(cachedIndex);
      setPrice(cachedPrice);    
      setBalance(cachedBalance);

      initializedRef.current = true;
    }
  }, []);

  useEffect(() => {
    // Save params to local
    localStorage.setItem("epochIndex", epochIndex.toString());
    localStorage.setItem("price", price.toString());      
    localStorage.setItem("balance", balance.toString());      
  }, [epochIndex, price, balance]);

  const incrementEpochIndex = () => {
    setEpochIndex((epochIndex) => epochIndex + 1);
  };

  const updatePrice = (newPrice: number) => {
    setPrice(newPrice);
  }

  const updateBalance = (newBalance: number) => {
    setBalance(newBalance);
  };

  const value: LocalEpochContextValue = {
    epochIndex,
    setEpochIndex,
    incrementEpochIndex,
    price,
    setPrice,
    updatePrice,
    balance,
    setBalance,
    updateBalance,
  };

  return createElement(
    LocalEpochContext.Provider,
    { value },
    children
  );
};

export const useLocalEpochContext = () => useContext(LocalEpochContext);