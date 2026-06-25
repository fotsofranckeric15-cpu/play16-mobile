import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { getCurrentCGU, acceptCGU } from './api';
import { COLORS } from './config';

export default function CGUScreen({ navigation }) {
  const [cgu, setCgu]           = useState(null);
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);

  useEffect(() => { getCurrentCGU().then(d=>{setCgu(d);setLoading(false);}).catch(()=>setLoading(false)); }, []);

  async function onAccept() {
    if (!accepted) return Alert.alert('', 'Veuillez cocher la case.');
    setSaving(true);
    try { await acceptCGU(cgu?.version_number||1); navigation.replace('Main'); }
    catch(err) { Alert.alert('Erreur', err.message); }
    finally { setSaving(false); }
  }

  if (loading) return <View style={s.center}><ActivityIndicator color={COLORS.primary} size="large"/></View>;

  return (
    <View style={s.container}>
      <View style={s.header}><Text style={s.title}>📜 Conditions Générales</Text></View>
      <ScrollView style={s.scroll} contentContainerStyle={{padding:20}}>
        <Text style={s.text}>{cgu?.empty ? "Les CGU seront disponibles prochainement." : cgu?.content}</Text>
      </ScrollView>
      <View style={s.footer}>
        <TouchableOpacity style={s.checkRow} onPress={()=>setAccepted(!accepted)}>
          <View style={[s.checkbox, accepted&&s.checkboxOn]}>{accepted&&<Text style={{color:'#fff'}}>✓</Text>}</View>
          <Text style={s.checkLabel}>J'ai lu et j'accepte les conditions générales d'utilisation</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.btn,!accepted&&{opacity:0.5}]} onPress={onAccept} disabled={!accepted||saving}>
          {saving?<ActivityIndicator color="#fff"/>:<Text style={s.btnText}>Continuer</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container:{flex:1,backgroundColor:COLORS.white},
  center:{flex:1,justifyContent:'center',alignItems:'center'},
  header:{paddingTop:54,paddingBottom:16,paddingHorizontal:20,borderBottomWidth:1,borderBottomColor:COLORS.border},
  title:{fontSize:17,fontWeight:'700',textAlign:'center',color:COLORS.text},
  scroll:{flex:1},
  text:{fontSize:13,color:COLORS.text,lineHeight:22},
  footer:{padding:20,borderTopWidth:1,borderTopColor:COLORS.border},
  checkRow:{flexDirection:'row',alignItems:'flex-start',gap:12,marginBottom:16},
  checkbox:{width:22,height:22,borderRadius:5,borderWidth:2,borderColor:COLORS.primary,justifyContent:'center',alignItems:'center'},
  checkboxOn:{backgroundColor:COLORS.primary},
  checkLabel:{flex:1,fontSize:13,color:COLORS.text,lineHeight:20},
  btn:{backgroundColor:COLORS.primary,borderRadius:13,paddingVertical:15,alignItems:'center'},
  btnText:{color:'#fff',fontSize:15,fontWeight:'700'},
});
