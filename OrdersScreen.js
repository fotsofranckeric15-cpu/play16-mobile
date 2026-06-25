import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { getMyOrders, confirmReceipt } from './api';
import { useFeature } from './FeatureContext';
import { COLORS } from './config';

const STATUS = {
  pending:{label:'En attente',color:COLORS.gold},
  paid:{label:'Payée',color:COLORS.blue},
  in_transit:{label:'En transit 🚚',color:COLORS.primary},
  delivered:{label:'Livrée ✅',color:COLORS.green},
  cancelled:{label:'Annulée',color:COLORS.red},
};

export default function OrdersScreen({ navigation }) {
  const [orders,setOrders]         = useState([]);
  const [loading,setLoading]       = useState(true);
  const [refreshing,setRefreshing] = useState(false);
  const [tab,setTab]               = useState('active');
  const [returnPolicy,setPolicy]   = useState(null);
  const [confirming,setConfirming] = useState(null);
  const cashbackEnabled = useFeature('cashback_system');

  useEffect(()=>{ load(); },[tab]);

  async function load() {
    try {
      const map={active:undefined,delivered:'delivered',cancelled:'cancelled'};
      const r = await getMyOrders(map[tab]);
      setOrders(r.orders); setPolicy(r.return_policy);
    } catch(e){ console.error(e.message); }
    finally { setLoading(false); setRefreshing(false); }
  }

  const onRefresh = useCallback(()=>{ setRefreshing(true); load(); },[tab]);

  async function onConfirm(orderId) {
    setConfirming(orderId);
    try {
      const r = await confirmReceipt(orderId);
      if (r.cashback_credited>0&&cashbackEnabled) {
        Alert.alert('✅ Livraison confirmée !',
          `+${r.cashback_credited?.toLocaleString()} FCFA cashback crédités !${r.propose_2fa?'\n\n🔐 Voulez-vous activer la 2FA ?':''}`,
          r.propose_2fa?[{text:'Plus tard'},{text:'Activer',onPress:()=>navigation.navigate('Profil')}]:[{text:'Super !'}]);
      } else {
        Alert.alert('✅ Livraison confirmée !', 'Merci pour votre commande.');
      }
      load();
    } catch(err) { Alert.alert('Erreur', err.message); }
    finally { setConfirming(null); }
  }

  function Card({ o }) {
    const st = STATUS[o.status]||{label:o.status,color:COLORS.textSub};
    return (
      <View style={s.card}>
        <View style={s.cardTop}>
          <Text style={s.orderId}>#{o.id?.slice(0,8).toUpperCase()}</Text>
          <View style={[s.badge,{backgroundColor:st.color+'20'}]}>
            <View style={[s.dot,{backgroundColor:st.color}]}/>
            <Text style={[s.badgeTxt,{color:st.color}]}>{st.label}</Text>
          </View>
        </View>
        <Text style={s.pName}>{o.product_name}</Text>
        {(o.color||o.size)&&<Text style={s.variant}>{[o.color,o.size].filter(Boolean).join(' — ')}</Text>}
        <View style={s.cardBot}>
          <Text style={s.price}>{o.total_amount?.toLocaleString()} FCFA</Text>
          {cashbackEnabled&&o.cashback_earned>0&&(
            <Text style={s.cb}>+{o.cashback_earned?.toLocaleString()} FCFA cashback</Text>
          )}
        </View>
        {o.status==='in_transit'&&(
          <TouchableOpacity style={s.confirmBtn} onPress={()=>onConfirm(o.id)} disabled={confirming===o.id}>
            {confirming===o.id?<ActivityIndicator color="#fff"/>:<Text style={s.confirmTxt}>✅ J'ai reçu ma commande</Text>}
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.header}><Text style={s.headerTitle}>Mes commandes</Text></View>
      <View style={s.tabs}>
        {[['active','En cours'],['delivered','Livrées'],['cancelled','Annulées']].map(([k,l])=>(
          <TouchableOpacity key={k} style={[s.tab,tab===k&&s.tabOn]} onPress={()=>setTab(k)}>
            <Text style={[s.tabTxt,tab===k&&s.tabTxtOn]}>{l}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {loading?<ActivityIndicator style={{marginTop:40}} color={COLORS.primary} size="large"/>:(
        <ScrollView contentContainerStyle={s.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}>
          {orders.length===0&&<Text style={s.empty}>Aucune commande</Text>}
          {orders.map(o=><Card key={o.id} o={o}/>)}
          {returnPolicy?.show&&(
            <View style={s.policy}>
              <Text style={s.policyTitle}>📦 Politique de retour</Text>
              {returnPolicy.cases?.map((c,i)=><Text key={i} style={s.policyCase}>• {c}</Text>)}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container:{flex:1,backgroundColor:COLORS.bg},
  header:{backgroundColor:COLORS.white,paddingTop:54,paddingBottom:16,paddingHorizontal:16,borderBottomWidth:1,borderBottomColor:COLORS.border},
  headerTitle:{fontSize:20,fontWeight:'800',color:COLORS.text},
  tabs:{flexDirection:'row',backgroundColor:COLORS.white,padding:8,gap:8},
  tab:{flex:1,paddingVertical:8,borderRadius:9,backgroundColor:COLORS.bg,alignItems:'center'},
  tabOn:{backgroundColor:COLORS.primary},
  tabTxt:{fontSize:13,fontWeight:'600',color:COLORS.textSub},
  tabTxtOn:{color:'#fff'},
  list:{padding:14,gap:12},
  empty:{textAlign:'center',color:COLORS.textSub,marginTop:40},
  card:{backgroundColor:COLORS.white,borderRadius:16,padding:16,borderWidth:1,borderColor:COLORS.border},
  cardTop:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:6},
  orderId:{fontSize:12,color:COLORS.textSub,fontWeight:'600'},
  badge:{flexDirection:'row',alignItems:'center',borderRadius:20,paddingHorizontal:10,paddingVertical:4,gap:5},
  dot:{width:6,height:6,borderRadius:3},
  badgeTxt:{fontSize:12,fontWeight:'600'},
  pName:{fontSize:15,fontWeight:'700',color:COLORS.text,marginBottom:4},
  variant:{fontSize:12,color:COLORS.textSub,marginBottom:8},
  cardBot:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  price:{fontSize:16,fontWeight:'800',color:COLORS.text},
  cb:{fontSize:12,color:COLORS.green,fontWeight:'600'},
  confirmBtn:{backgroundColor:COLORS.green,borderRadius:10,paddingVertical:12,alignItems:'center',marginTop:12},
  confirmTxt:{color:'#fff',fontWeight:'700',fontSize:14},
  policy:{backgroundColor:COLORS.goldLight,borderWidth:1,borderColor:COLORS.gold+'40',borderRadius:14,padding:16,marginTop:8},
  policyTitle:{fontSize:13,fontWeight:'700',marginBottom:8,color:COLORS.text},
  policyCase:{fontSize:12,color:COLORS.textSub,lineHeight:20},
});
