import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from './config';

export default function SupplierDashboard({ navigation }) {
  const [tab, setTab] = useState('dashboard');

  function Stat({ icon, value, label, color=COLORS.primary }) {
    return (
      <View style={s.statCard}>
        <Text style={{fontSize:22}}>{icon}</Text>
        <Text style={[s.statVal,{color}]}>{value}</Text>
        <Text style={s.statLabel}>{label}</Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={()=>navigation.goBack()}><Text style={s.back}>‹</Text></TouchableOpacity>
        <Text style={s.headerTitle}>Espace fournisseur</Text>
        <View style={s.verBadge}><Text style={s.verTxt}>✓ Vérifié</Text></View>
      </View>
      <View style={s.tabs}>
        {[['dashboard','Dashboard'],['produits','Produits'],['commandes','Commandes']].map(([k,l])=>(
          <TouchableOpacity key={k} style={[s.tab,tab===k&&s.tabOn]} onPress={()=>setTab(k)}>
            <Text style={[s.tabTxt,tab===k&&s.tabTxtOn]}>{l}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView contentContainerStyle={s.content}>
        {tab==='dashboard'&&(
          <>
            <View style={s.statsGrid}>
              <Stat icon="💰" value="145 000 FCFA" label="Revenus ce mois" color={COLORS.green}/>
              <Stat icon="🛒" value="12" label="Commandes" color={COLORS.primary}/>
              <Stat icon="📦" value="8" label="Produits actifs" color={COLORS.blue}/>
              <Stat icon="⭐" value="4.7/5" label="Note moyenne" color={COLORS.gold}/>
            </View>
            <View style={s.card}>
              <Text style={s.cardTitle}>🔐 Paiements en séquestre</Text>
              <View style={[s.escrowBox,{backgroundColor:COLORS.goldLight}]}>
                <Text style={s.escrowLabel}>En attente confirmation client</Text>
                <Text style={[s.escrowAmt,{color:COLORS.gold}]}>35 320 FCFA</Text>
              </View>
              <View style={[s.escrowBox,{backgroundColor:COLORS.greenLight,marginTop:8}]}>
                <Text style={s.escrowLabel}>Versement en cours (24h)</Text>
                <Text style={[s.escrowAmt,{color:COLORS.green}]}>109 680 FCFA</Text>
              </View>
            </View>
            <View style={[s.card,{backgroundColor:COLORS.primaryLight,borderColor:COLORS.primaryBorder}]}>
              <Text style={s.cardTitle}>💡 Conseils pour vos ventes</Text>
              <Text style={s.tipTxt}>
                • Ajoutez des photos de qualité{'\n'}
                • Demandez une mise en avant (boost){'\n'}
                • Répondez rapidement aux commandes{'\n'}
                • Vérifiez votre boutique pour débloquer le cashback
              </Text>
            </View>
          </>
        )}
        {tab==='produits'&&(
          <View style={s.emptyTab}>
            <Text style={s.emptyIcon}>📦</Text>
            <Text style={s.emptyTitle}>Gérez vos produits</Text>
            <Text style={s.emptyTxt}>Ajoutez vos produits avec photos, variantes et stock en temps réel.</Text>
            <TouchableOpacity style={s.addBtn}><Text style={s.addBtnTxt}>+ Ajouter un produit</Text></TouchableOpacity>
          </View>
        )}
        {tab==='commandes'&&(
          <View style={s.emptyTab}>
            <Text style={s.emptyIcon}>🛒</Text>
            <Text style={s.emptyTitle}>Vos commandes</Text>
            <Text style={s.emptyTxt}>Les commandes de vos clients apparaîtront ici avec statut en temps réel.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container:{flex:1,backgroundColor:COLORS.bg},
  header:{backgroundColor:COLORS.white,flexDirection:'row',alignItems:'center',paddingTop:54,paddingBottom:14,paddingHorizontal:16,borderBottomWidth:1,borderBottomColor:COLORS.border,gap:10},
  back:{fontSize:28,color:COLORS.primary},
  headerTitle:{flex:1,fontSize:16,fontWeight:'700',color:COLORS.text},
  verBadge:{backgroundColor:COLORS.greenLight,borderRadius:10,paddingHorizontal:8,paddingVertical:3},
  verTxt:{color:COLORS.green,fontSize:11,fontWeight:'700'},
  tabs:{flexDirection:'row',backgroundColor:COLORS.white,padding:8,gap:6},
  tab:{flex:1,paddingVertical:8,borderRadius:9,backgroundColor:COLORS.bg,alignItems:'center'},
  tabOn:{backgroundColor:COLORS.green},
  tabTxt:{fontSize:12,fontWeight:'600',color:COLORS.textSub},
  tabTxtOn:{color:'#fff'},
  content:{padding:14,gap:12},
  statsGrid:{flexDirection:'row',flexWrap:'wrap',gap:10},
  statCard:{backgroundColor:COLORS.white,borderRadius:14,padding:14,width:'47%',borderWidth:1,borderColor:COLORS.border},
  statVal:{fontSize:16,fontWeight:'800',marginTop:6,marginBottom:2},
  statLabel:{fontSize:11,color:COLORS.textSub},
  card:{backgroundColor:COLORS.white,borderRadius:14,padding:16,borderWidth:1,borderColor:COLORS.border},
  cardTitle:{fontSize:14,fontWeight:'700',color:COLORS.text,marginBottom:12},
  escrowBox:{borderRadius:10,padding:12},
  escrowLabel:{fontSize:11,color:COLORS.textSub,marginBottom:4},
  escrowAmt:{fontSize:18,fontWeight:'800'},
  tipTxt:{fontSize:12,color:COLORS.text,lineHeight:22},
  emptyTab:{alignItems:'center',paddingTop:40,paddingHorizontal:24},
  emptyIcon:{fontSize:48,marginBottom:12},
  emptyTitle:{fontSize:17,fontWeight:'700',color:COLORS.text,marginBottom:8},
  emptyTxt:{fontSize:13,color:COLORS.textSub,textAlign:'center',lineHeight:20,marginBottom:20},
  addBtn:{backgroundColor:COLORS.primary,borderRadius:12,paddingHorizontal:24,paddingVertical:13},
  addBtnTxt:{color:'#fff',fontWeight:'700'},
});
