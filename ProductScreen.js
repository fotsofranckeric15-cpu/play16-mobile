import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, Modal } from 'react-native';
import { getProduct, createOrder } from './api';
import { useFeature } from './FeatureContext';
import { COLORS } from './config';

export default function ProductScreen({ route, navigation }) {
  const { productId } = route.params;
  const [product, setProduct]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [selectedColor, setColor]   = useState(null);
  const [selectedSize, setSize]     = useState(null);
  const [ordering, setOrdering]     = useState(false);
  const [showNotice, setNotice]     = useState(false);
  const cashbackEnabled = useFeature('cashback_system');

  useEffect(() => {
    getProduct(productId).then(d => {
      setProduct(d); setLoading(false);
      if (d.show_unverified_notice) setNotice(true);
    }).catch(() => setLoading(false));
  }, [productId]);

  const colors = [...new Set(product?.variants?.map(v=>v.color).filter(Boolean))];
  const selectedVariant = product?.variants?.find(v=>
    (!selectedColor||v.color===selectedColor)&&(!selectedSize||v.size===selectedSize));

  async function onBuy(method) {
    if (product?.variants?.length > 0 && !selectedVariant)
      return Alert.alert('', 'Choisissez une variante');
    const variantId = selectedVariant?.id || product?.variants?.[0]?.id;
    if (!variantId) return Alert.alert('Erreur', 'Variante introuvable');
    setOrdering(true);
    try {
      const r = await createOrder(variantId, method);
      Alert.alert('✅ Commande passée !', `#${r.order.id.slice(0,8).toUpperCase()}`,
        [{text:'Voir mes commandes', onPress:()=>navigation.navigate('Commandes')}]);
    } catch(err) { Alert.alert('Erreur', err.message); }
    finally { setOrdering(false); }
  }

  if (loading) return <View style={s.center}><ActivityIndicator color={COLORS.primary} size="large"/></View>;
  if (!product) return <View style={s.center}><Text>Produit introuvable</Text></View>;

  const price = product.discounted_price || product.base_price;

  return (
    <View style={{flex:1,backgroundColor:COLORS.white}}>
      <Modal visible={showNotice} transparent animationType="slide">
        <View style={s.overlay}>
          <View style={s.noticeBox}>
            <Text style={s.noticeTitle}>⚠️ Vendeur non vérifié</Text>
            <Text style={s.noticeText}>{product.unverified_notice_text}</Text>
            <TouchableOpacity style={s.btn} onPress={()=>setNotice(false)}>
              <Text style={s.btnTxt}>J'ai compris</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={s.topBar}>
        <TouchableOpacity onPress={()=>navigation.goBack()}><Text style={s.backBtn}>‹</Text></TouchableOpacity>
        <Text style={s.topTitle} numberOfLines={1}>{product.name}</Text>
      </View>

      <ScrollView>
        <View style={s.imgBox}>
          <Text style={{fontSize:80}}>📦</Text>
          {product.supplier_verified&&<View style={s.verBadge}><Text style={s.verTxt}>✓ Vérifié</Text></View>}
        </View>
        <View style={s.body}>
          <View style={s.priceRow}>
            <View>
              <Text style={s.price}>{price?.toLocaleString()} FCFA</Text>
              {product.discounted_price&&<Text style={s.oldPrice}>{product.base_price?.toLocaleString()} FCFA</Text>}
            </View>
            {cashbackEnabled&&product.cashback_amount>0&&product.supplier_verified&&(
              <View style={s.cbBox}>
                <Text style={{fontSize:10,color:COLORS.textSub}}>Cashback</Text>
                <Text style={s.cbAmt}>+{product.cashback_amount?.toLocaleString()} FCFA</Text>
              </View>
            )}
          </View>
          <Text style={s.name}>{product.name}</Text>

          {colors.length>0&&(<>
            <Text style={s.varLabel}>Couleur : <Text style={{color:COLORS.primary}}>{selectedColor||'—'}</Text></Text>
            <View style={s.chips}>
              {colors.map(c=>(
                <TouchableOpacity key={c} style={[s.chip,selectedColor===c&&s.chipOn]} onPress={()=>setColor(c)}>
                  <Text style={[s.chipTxt,selectedColor===c&&{color:'#fff'}]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>)}

          {product.variants?.length>0&&(<>
            <Text style={s.varLabel}>Taille :</Text>
            <View style={s.chips}>
              {product.variants.filter(v=>!selectedColor||v.color===selectedColor).map(v=>(
                <TouchableOpacity key={v.id} style={[s.chip,selectedSize===v.size&&s.chipOn,v.stock===0&&s.chipOOS]}
                  onPress={()=>v.stock>0&&setSize(v.size)} disabled={v.stock===0}>
                  <Text style={[s.chipTxt,selectedSize===v.size&&{color:'#fff'},v.stock===0&&{textDecorationLine:'line-through'}]}>{v.size}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>)}

          {selectedVariant&&<Text style={s.stock}>✅ {selectedVariant.stock} disponible(s)</Text>}

          <TouchableOpacity style={s.btn} onPress={()=>onBuy('mobile_money')} disabled={ordering}>
            {ordering?<ActivityIndicator color="#fff"/>:<Text style={s.btnTxt}>Acheter maintenant</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={s.btnOutline} onPress={()=>onBuy('cash')}>
            <Text style={[s.btnTxt,{color:COLORS.primary}]}>Payer à la livraison</Text>
          </TouchableOpacity>
          {product.supplier_whatsapp&&(
            <TouchableOpacity style={s.btnWA} onPress={()=>onBuy('whatsapp')}>
              <Text style={[s.btnTxt,{color:'#25D366'}]}>💬 Contacter via WhatsApp</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  center:{flex:1,justifyContent:'center',alignItems:'center'},
  topBar:{flexDirection:'row',alignItems:'center',paddingTop:52,paddingBottom:12,paddingHorizontal:16,borderBottomWidth:1,borderBottomColor:COLORS.border,backgroundColor:COLORS.white,gap:12},
  backBtn:{fontSize:28,color:COLORS.primary},
  topTitle:{flex:1,fontSize:16,fontWeight:'700',color:COLORS.text},
  imgBox:{backgroundColor:COLORS.bg,height:220,justifyContent:'center',alignItems:'center',position:'relative'},
  verBadge:{position:'absolute',top:14,right:14,backgroundColor:COLORS.green,borderRadius:6,paddingHorizontal:10,paddingVertical:4},
  verTxt:{color:'#fff',fontSize:12,fontWeight:'700'},
  body:{padding:16},
  priceRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10},
  price:{fontSize:26,fontWeight:'800',color:COLORS.text},
  oldPrice:{fontSize:14,color:COLORS.textLight,textDecorationLine:'line-through'},
  cbBox:{backgroundColor:COLORS.greenLight,borderWidth:1,borderColor:COLORS.green+'40',borderRadius:12,padding:8,alignItems:'flex-end'},
  cbAmt:{fontSize:14,fontWeight:'800',color:COLORS.green},
  name:{fontSize:17,fontWeight:'700',color:COLORS.text,marginBottom:14},
  varLabel:{fontSize:13,fontWeight:'700',color:COLORS.text,marginBottom:8,marginTop:4},
  chips:{flexDirection:'row',flexWrap:'wrap',gap:8,marginBottom:14},
  chip:{paddingHorizontal:14,paddingVertical:8,borderRadius:10,borderWidth:1,borderColor:COLORS.border,backgroundColor:COLORS.bg},
  chipOn:{backgroundColor:COLORS.primary,borderColor:COLORS.primary},
  chipOOS:{opacity:0.4},
  chipTxt:{fontSize:13,fontWeight:'600',color:COLORS.text},
  stock:{color:COLORS.green,fontWeight:'600',fontSize:13,marginBottom:16},
  btn:{backgroundColor:COLORS.primary,borderRadius:13,paddingVertical:15,alignItems:'center',marginBottom:10},
  btnTxt:{color:'#fff',fontSize:15,fontWeight:'700'},
  btnOutline:{borderWidth:1.5,borderColor:COLORS.primary,backgroundColor:COLORS.primaryLight,borderRadius:13,paddingVertical:15,alignItems:'center',marginBottom:10},
  btnWA:{borderWidth:1.5,borderColor:'#25D36630',backgroundColor:'#25D36608',borderRadius:13,paddingVertical:15,alignItems:'center',marginBottom:10},
  overlay:{flex:1,backgroundColor:'rgba(0,0,0,0.5)',justifyContent:'flex-end'},
  noticeBox:{backgroundColor:COLORS.white,borderTopLeftRadius:20,borderTopRightRadius:20,padding:24,gap:14},
  noticeTitle:{fontSize:17,fontWeight:'800',color:COLORS.gold},
  noticeText:{fontSize:13,color:COLORS.text,lineHeight:20},
});
