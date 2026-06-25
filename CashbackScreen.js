import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { getUser, getPublicSetting } from './api';
import { COLORS } from './config';

export default function CashbackScreen({ navigation }) {
  const [user, setUser]           = useState(null);
  const [threshold, setThreshold] = useState(7500);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([getUser(), getPublicSetting('cashback_withdrawal_threshold')])
      .then(([u,t]) => { setUser(u); setThreshold(parseInt(t?.value||'7500')); })
      .finally(() => setLoading(false));
  }, []);

  const balance    = user?.cashback_balance||0;
  const progress   = Math.min((balance/threshold)*100,100);
  const canWithdraw = balance >= threshold;

  if (loading) return <View style={s.center}><ActivityIndicator color={COLORS.primary}/></View>;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={()=>navigation.goBack()}><Text style={s.back}>‹</Text></TouchableOpacity>
        <Text style={s.headerTitle}>Mon Cashback</Text>
      </View>
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.balCard}>
          <Text style={s.balLabel}>Solde disponible</Text>
          <Text style={s.balAmt}>{balance.toLocaleString()} FCFA</Text>
          <Text style={s.balSub}>Seuil de retrait : {threshold.toLocaleString()} FCFA</Text>
          <View style={s.progBg}><View style={[s.progFill,{width:`${progress}%`}]}/></View>
          <Text style={s.progTxt}>{canWithdraw?'✅ Vous pouvez retirer !':`Encore ${(threshold-balance).toLocaleString()} FCFA`}</Text>
        </View>
        <TouchableOpacity style={[s.wdBtn,!canWithdraw&&{opacity:0.5}]} disabled={!canWithdraw}
          onPress={()=>Alert.alert('Retrait','Disponible après activation du partenaire de paiement.')}>
          <Text style={s.wdTxt}>💸 Retirer mon cashback</Text>
        </TouchableOpacity>
        <View style={s.card}>
          <Text style={s.cardTitle}>🎁 Comment gagner du cashback ?</Text>
          {[['🛍️','Achetez chez un fournisseur vérifié (badge ✓) et confirmez la réception'],
            ['👥','Parrainez un ami — 500 FCFA à son inscription + 1 000 FCFA à son premier achat'],
            ['🎲','Scannez votre QR Code de récompense après chaque livraison']
          ].map(([ic,tx],i)=>(
            <View key={i} style={s.howRow}>
              <Text style={s.howIcon}>{ic}</Text>
              <Text style={s.howTxt}>{tx}</Text>
            </View>
          ))}
        </View>
        <View style={s.card}>
          <Text style={s.cardTitle}>📋 Historique</Text>
          <Text style={s.emptyHist}>Vos transactions cashback apparaîtront ici.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container:{flex:1,backgroundColor:COLORS.bg},
  center:{flex:1,justifyContent:'center',alignItems:'center'},
  header:{backgroundColor:COLORS.white,flexDirection:'row',alignItems:'center',paddingTop:54,paddingBottom:14,paddingHorizontal:16,borderBottomWidth:1,borderBottomColor:COLORS.border,gap:12},
  back:{fontSize:28,color:COLORS.primary},
  headerTitle:{fontSize:18,fontWeight:'700',color:COLORS.text},
  content:{padding:14,gap:12},
  balCard:{backgroundColor:COLORS.primary,borderRadius:20,padding:22},
  balLabel:{color:'rgba(255,255,255,0.7)',fontSize:13},
  balAmt:{color:'#fff',fontSize:36,fontWeight:'800',marginTop:4},
  balSub:{color:'rgba(255,255,255,0.6)',fontSize:12,marginTop:4,marginBottom:16},
  progBg:{height:6,backgroundColor:'rgba(255,255,255,0.2)',borderRadius:3,marginBottom:8},
  progFill:{height:6,backgroundColor:'#fff',borderRadius:3},
  progTxt:{color:'rgba(255,255,255,0.8)',fontSize:11},
  wdBtn:{backgroundColor:COLORS.green,borderRadius:14,paddingVertical:15,alignItems:'center'},
  wdTxt:{color:'#fff',fontSize:15,fontWeight:'700'},
  card:{backgroundColor:COLORS.white,borderRadius:14,padding:16,borderWidth:1,borderColor:COLORS.border},
  cardTitle:{fontSize:14,fontWeight:'700',color:COLORS.text,marginBottom:12},
  howRow:{flexDirection:'row',gap:10,marginBottom:12,alignItems:'flex-start'},
  howIcon:{fontSize:18},
  howTxt:{flex:1,fontSize:13,color:COLORS.textSub,lineHeight:18},
  emptyHist:{color:COLORS.textSub,fontSize:13,textAlign:'center',paddingVertical:20},
});
