import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAppConfig } from './api';

const FeatureContext = createContext({});
const DEFAULT = {
  play_store_review_mode:false, user_registration:true, product_catalog:true,
  product_search:true, orders:true, standard_payment:true, buyer_seller_messaging:true,
  standard_notifications:true, account_management:true, cashback_system:true,
  wallet_balance:true, withdrawals:true, installment_credit:true, cash_work_system:true,
  lottery_system:true, referral_rewards:true, reward_notifications:true,
  boost_system:true, supplier_verification:true, external_payment_escrow:true, two_fa:true,
};

export function FeatureProvider({ children }) {
  const [features, setFeatures] = useState(DEFAULT);
  const [loaded, setLoaded]     = useState(false);

  useEffect(() => { loadConfig(); }, []);

  async function loadConfig() {
    try { const cfg = await getAppConfig(); setFeatures(cfg); }
    catch { /* mode hors ligne : valeurs par défaut */ }
    finally { setLoaded(true); }
  }

  return (
    <FeatureContext.Provider value={{ features, loaded, reload: loadConfig }}>
      {children}
    </FeatureContext.Provider>
  );
}

export const useFeatures = () => useContext(FeatureContext);
export const useFeature  = (key) => useContext(FeatureContext).features[key] === true;
