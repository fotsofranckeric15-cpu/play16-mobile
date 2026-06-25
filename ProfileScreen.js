import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { getUser, clearToken } from './api';
import { useFeature } from './FeatureContext';
import { COLORS } from './config';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const cashbackEnabled = useFeature('cashback_system');
  const walletEnabled   = useFeature('wallet_balance');
  const withdrawEnabled = useFeature('withdrawals');
  const cashworkEnabled = useFeature('cash_work_system');
  const referralEnabled = useFeature('referral_rewards');
  const twoFAEnabled    = useFeature('two_fa');

  useEffect(() => { getUser().then(setUser); }, []);

  async function onLogout() {
    Alert.alert('Déconnexion','Voulez-vous vous déconnecter ?',[
      {text:'Annuler',style:'cancel'},
      {text:'Se déconnecter',style:'destructive',onPress:async()=>{ await clearToken(); navigation.replace('Login'); }},
    ]);
  }

  function Item({ icon, label, onPress, color=COLORS.text, badge }) {
    return (
      <TouchableOpacity style={s.item} onPress={onPress}>
        <Text style={s.itemIcon}>{icon}</Text>
        <Text style={[s.itemLabel,{color}]}>{label}</Text>
        {badge&&<View style={s.badge}><Text style={s.badgeTxt}>{badge}</Text></View>}
        <Text style={s.arrow}>›</Text>
      </TouchableOpacity>
    );
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.header}>
        <View style={s.avatar}><Text style={s.avatarTxt}>{user?.full_name?.[0]||'👤'}</Text></View>
        <Text style={s.name}>{user?.full_name||'Mon compte'}</Text>
        <Text style={s.phone}>{user?.phone_number}</Text>
        {user?.supplier_verified&&<View style={s.verBadge}><Text style={s.verTxt}>✓ Fournisseur vérifié</Text></View>}
      </View>

      {cashbackEnabled&&walletEnabled&&(
        <View style={s.cbCard}>
          <View><Text style={s.cbLabel}>Solde cashback</Text>
            <Text style={s.cbAmount}>{(user?.cashback_balance||0).toLocaleString()} FCFA</Text>
          </View>
          {withdrawEnabled&&<TouchableOpacity style={s.wdBtn} onPress={()=>navigation.navigate('Cashback')}>
            <Text style={s.wdTxt}>Voir</Text>
          </TouchableOpacity>}
        </View>
      )}

      <View style={s.section}>
        <Text style={s.sectionTitle}>MON COMPTE</Text>
        <Item icon="✏️" label="Modifier mes informations" onPress={()=>{}}/>
        {twoFAEnabled&&<Item icon="🔐" label="Double authentification (2FA)" onPress={()=>{}}/>}
        <Item icon="📋" label="Conditions générales" onPress={()=>navigation.navigate('CGU')}/>
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>MES ACTIVITÉS</Text>
        {!user?.is_supplier&&<Item icon="🏪" label="Devenir fournisseur" onPress={()=>{}} badge="Gratuit"/>}
        {user?.is_supplier&&<Item icon="📊" label="Espace fournisseur" onPress={()=>navigation.navigate('SupplierDash')}/>}
        {cashworkEnabled&&!user?.is_cash_worker&&<Item icon="💼" label="Devenir prestataire Cash-Work" onPress={()=>{}}/>}
        {cashworkEnabled&&user?.is_cash_worker&&<Item icon="💼" label="Mon espace Cash-Work" onPress={()=>navigation.navigate('CashWork')}/>}
        {referralEnabled&&<Item icon="🎁" label="Parrainer un ami" onPress={()=>{}}/>}
      </View>

      <View style={s.section}>
        <Item icon="🚪" label="Se déconnecter" onPress={onLogout} color={COLORS.red}/>
      </View>
      <Text style={s.version}>Play16 v1.0.0</Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:{flex:1,backgroundColor:COLORS.bg},
  content:{paddingBottom:40},
  header:{backgroundColor:COLORS.white,alignItems:'center',paddingTop:60,paddingBottom:24,marginBottom:12},
  avatar:{width:72,height:72,borderRadius:36,backgroundColor:COLORS.primaryLight,justifyContent:'center',alignItems:'center',marginBottom:12},
  avatarTxt:{fontSize:28},
  name:{fontSize:18,fontWeight:'800',color:COLORS.text},
  phone:{fontSize:14,color:COLORS.textSub,marginTop:4},
  verBadge:{marginTop:8,backgroundColor:COLORS.greenLight,borderRadius:20,paddingHorizontal:12,paddingVertical:4},
  verTxt:{color:COLORS.green,fontSize:12,fontWeight:'700'},
  cbCard:{backgroundColor:COLORS.primary,margin:14,borderRadius:16,padding:18,flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  cbLabel:{color:'rgba(255,255,255,0.7)',fontSize:12},
  cbAmount:{color:'#fff',fontSize:22,fontWeight:'800'},
  wdBtn:{backgroundColor:'rgba(255,255,255,0.2)',borderRadius:10,paddingHorizontal:16,paddingVertical:8},
  wdTxt:{color:'#fff',fontWeight:'700',fontSize:13},
  section:{backgroundColor:COLORS.white,marginHorizontal:14,marginBottom:12,borderRadius:16,overflow:'hidden'},
  sectionTitle:{fontSize:10,fontWeight:'800',color:COLORS.textLight,letterSpacing:1.5,paddingHorizontal:16,paddingTop:12,paddingBottom:4},
  item:{flexDirection:'row',alignItems:'center',paddingHorizontal:16,paddingVertical:14,borderTopWidth:0.5,borderTopColor:COLORS.border},
  itemIcon:{fontSize:18,marginRight:12,width:24,textAlign:'center'},
  itemLabel:{flex:1,fontSize:14,fontWeight:'500'},
  badge:{backgroundColor:COLORS.green,borderRadius:10,paddingHorizontal:8,paddingVertical:2,marginRight:8},
  badgeTxt:{color:'#fff',fontSize:10,fontWeight:'700'},
  arrow:{color:COLORS.textLight,fontSize:18},
  version:{textAlign:'center',color:COLORS.textLight,fontSize:11,marginTop:20},
});
