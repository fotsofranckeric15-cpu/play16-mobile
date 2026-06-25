import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, FlatList,
  RefreshControl, StyleSheet, ActivityIndicator } from 'react-native';
import { useFeature } from './FeatureContext';
import { getProducts, clickProduct, getUser } from './api';
import { COLORS } from './config';

const CATS = ['Tous','Chaussures','Vêtements','Accessoires','Sport','Électronique'];

export default function HomeScreen({ navigation }) {
  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]         = useState('');
  const [category, setCategory]     = useState('');
  const [page, setPage]             = useState(1);
  const [hasMore, setHasMore]       = useState(true);
  const [user, setUser]             = useState(null);
  const cashbackEnabled = useFeature('cashback_system');
  const cashworkEnabled = useFeature('cash_work_system');
  const extPayEnabled   = useFeature('external_payment_escrow');

  useEffect(() => { getUser().then(setUser); load(true); }, [category]);

  async function load(reset=false) {
    try {
      const p = reset ? 1 : page;
      const r = await getProducts({ category: category||undefined, page: p });
      reset ? setProducts(r.products) : setProducts(prev=>[...prev,...r.products]);
      setPage(reset ? 2 : p+1);
      setHasMore(r.has_more);
    } catch(e) { console.error(e.message); }
    finally { setLoading(false); setRefreshing(false); }
  }

  const onRefresh = useCallback(()=>{ setRefreshing(true); load(true); },[category]);

  async function onPress(p) {
    await clickProduct(p.id).catch(()=>{});
    navigation.navigate('Product', { productId: p.id });
  }

  function ProductCard({ item }) {
    return (
      <TouchableOpacity style={s.card} onPress={()=>onPress(item)}>
        {item.boost_level_active>0 && <View style={s.boostBadge}><Text style={s.boostTxt}>⚡×{item.boost_level_active}</Text></View>}
        {item.supplier_verified && <View style={s.verBadge}><Text style={s.verTxt}>✓</Text></View>}
        <View style={s.imgBox}><Text style={{fontSize:38}}>📦</Text></View>
        <View style={s.cardInfo}>
          <Text style={s.cardName} numberOfLines={2}>{item.name}</Text>
          {cashbackEnabled && item.cashback_amount>0 && item.supplier_verified && (
            <Text style={s.cashback}>🎁 +{item.cashback_amount?.toLocaleString()} FCFA</Text>
          )}
          <Text style={s.price}>{(item.discounted_price||item.base_price)?.toLocaleString()} FCFA</Text>
          {item.discounted_price && <Text style={s.oldPrice}>{item.base_price?.toLocaleString()} FCFA</Text>}
        </View>
      </TouchableOpacity>
    );
  }

  const filtered = products.filter(p=>!search||p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <View style={s.container}>
      {/* HEADER */}
      <View style={s.header}>
        <View style={s.headerRow}>
          <View style={s.logo}>
            <View style={s.logoIcon}><Text style={{color:'#fff',fontWeight:'900',fontSize:16}}>P</Text></View>
            <Text style={s.logoTxt}>PLAY <Text style={{color:COLORS.primary}}>16</Text></Text>
          </View>
          <View style={{flexDirection:'row',gap:8}}>
            {cashbackEnabled && <TouchableOpacity style={s.cashPill} onPress={()=>navigation.navigate('Cashback')}>
              <Text style={s.cashPillTxt}>💰 Cashback</Text>
            </TouchableOpacity>}
            {extPayEnabled && <TouchableOpacity style={s.extPill} onPress={()=>navigation.navigate('ExternalPay')}>
              <Text style={s.extPillTxt}>🔐 Sécurisé</Text>
            </TouchableOpacity>}
          </View>
        </View>
        <TextInput style={s.search} placeholder="Rechercher un produit..." placeholderTextColor={COLORS.textLight}
          value={search} onChangeText={setSearch}/>
      </View>

      {/* CATÉGORIES */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.catsRow}>
        {CATS.map(c=>(
          <TouchableOpacity key={c}
            style={[s.catPill, category===(c==='Tous'?'':c) && s.catActive]}
            onPress={()=>setCategory(c==='Tous'?'':c)}>
            <Text style={[s.catTxt, category===(c==='Tous'?'':c) && s.catTxtActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* GRILLE */}
      {loading ? <ActivityIndicator style={{marginTop:40}} color={COLORS.primary} size="large"/> : (
        <FlatList data={filtered} renderItem={({item})=><ProductCard item={item}/>}
          keyExtractor={i=>i.id} numColumns={2} columnWrapperStyle={{gap:12,marginBottom:12}}
          contentContainerStyle={{padding:12}}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}
          onEndReached={()=>hasMore&&load()} onEndReachedThreshold={0.3}
          ListEmptyComponent={<Text style={s.empty}>Aucun produit trouvé</Text>}/>
      )}

      {/* FAB Cash-Work */}
      {cashworkEnabled && (
        <TouchableOpacity style={s.fab} onPress={()=>navigation.navigate('CashWork')}>
          <Text style={s.fabTxt}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container:{flex:1,backgroundColor:COLORS.bg},
  header:{backgroundColor:COLORS.white,paddingHorizontal:16,paddingTop:52,paddingBottom:12,borderBottomWidth:1,borderBottomColor:COLORS.border},
  headerRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:10},
  logo:{flexDirection:'row',alignItems:'center',gap:8},
  logoIcon:{width:32,height:32,borderRadius:9,backgroundColor:COLORS.primary,justifyContent:'center',alignItems:'center'},
  logoTxt:{fontSize:18,fontWeight:'800',color:COLORS.text},
  cashPill:{backgroundColor:COLORS.goldLight,borderRadius:16,paddingHorizontal:10,paddingVertical:5,borderWidth:1,borderColor:COLORS.gold+'40'},
  cashPillTxt:{fontSize:11,fontWeight:'700',color:COLORS.gold},
  extPill:{backgroundColor:COLORS.primaryLight,borderRadius:16,paddingHorizontal:10,paddingVertical:5,borderWidth:1,borderColor:COLORS.primaryBorder},
  extPillTxt:{fontSize:11,fontWeight:'700',color:COLORS.primary},
  search:{backgroundColor:COLORS.bg,borderWidth:1,borderColor:COLORS.border,borderRadius:10,paddingHorizontal:14,paddingVertical:11,fontSize:14,color:COLORS.text},
  catsRow:{backgroundColor:COLORS.white,paddingHorizontal:12,paddingVertical:10,flexGrow:0},
  catPill:{paddingHorizontal:16,paddingVertical:8,borderRadius:20,borderWidth:1,borderColor:COLORS.border,backgroundColor:COLORS.white,marginRight:8},
  catActive:{backgroundColor:COLORS.primary,borderColor:COLORS.primary},
  catTxt:{fontSize:13,fontWeight:'600',color:COLORS.textSub},
  catTxtActive:{color:COLORS.white},
  card:{flex:1,backgroundColor:COLORS.white,borderRadius:16,overflow:'hidden',borderWidth:1,borderColor:COLORS.border,position:'relative'},
  boostBadge:{position:'absolute',top:8,left:8,backgroundColor:COLORS.gold,borderRadius:6,paddingHorizontal:8,paddingVertical:3,zIndex:1},
  boostTxt:{color:COLORS.white,fontSize:11,fontWeight:'700'},
  verBadge:{position:'absolute',top:8,right:8,backgroundColor:COLORS.green,borderRadius:6,paddingHorizontal:7,paddingVertical:3,zIndex:1},
  verTxt:{color:COLORS.white,fontSize:11,fontWeight:'700'},
  imgBox:{backgroundColor:COLORS.bg,height:110,justifyContent:'center',alignItems:'center'},
  cardInfo:{padding:10},
  cardName:{fontSize:12,fontWeight:'600',color:COLORS.text,marginBottom:3},
  cashback:{fontSize:10,color:COLORS.green,fontWeight:'600',marginBottom:3},
  price:{fontSize:15,fontWeight:'800',color:COLORS.text},
  oldPrice:{fontSize:11,color:COLORS.textLight,textDecorationLine:'line-through'},
  empty:{textAlign:'center',color:COLORS.textSub,marginTop:40,padding:20},
  fab:{position:'absolute',bottom:90,right:16,width:56,height:56,borderRadius:28,backgroundColor:COLORS.primary,justifyContent:'center',alignItems:'center',elevation:6},
  fabTxt:{color:COLORS.white,fontSize:28,fontWeight:'900'},
});
