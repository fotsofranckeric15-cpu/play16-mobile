import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Alert, ActivityIndicator, Modal } from 'react-native';
import { getCashWorkPosts, createCashWorkPost, acceptCashWorkPost } from './api';
import { COLORS } from './config';

export default function CashWorkScreen({ navigation }) {
  const [tab, setTab]         = useState('posts');
  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [desc, setDesc]       = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    try { const r = await getCashWorkPosts(); setPosts(r.posts); }
    catch(e) { console.error(e.message); }
    finally { setLoading(false); }
  }

  async function onPublish() {
    if (!desc.trim()) return Alert.alert('', 'Décrivez votre besoin');
    setPosting(true);
    try {
      const r = await createCashWorkPost(desc);
      Alert.alert('✅ Annonce publiée !',
        r.workers_notified > 0 ? `${r.workers_notified} prestataire(s) notifié(s).` : 'Annonce dans le tableau public.');
      setShowNew(false); setDesc(''); load();
    } catch(err) { Alert.alert('Erreur', err.message); }
    finally { setPosting(false); }
  }

  async function onAccept(postId) {
    try {
      await acceptCashWorkPost(postId);
      Alert.alert('✅ Mission acceptée !',
        '⚠️ Tout paiement doit se faire via Play16. Tout paiement hors plateforme engage votre responsabilité.');
      load();
    } catch(err) { Alert.alert('Erreur', err.message); }
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.back}>‹</Text></TouchableOpacity>
        <Text style={s.title}>Cash-Work</Text>
        <TouchableOpacity style={s.newBtn} onPress={() => setShowNew(true)}>
          <Text style={s.newTxt}>+ Publier</Text>
        </TouchableOpacity>
      </View>

      <View style={s.warning}>
        <Text style={s.warningTxt}>⚠️ Tout paiement hors plateforme = fraude possible. Utilisez toujours Play16.</Text>
      </View>

      <View style={s.tabs}>
        {[['posts','Annonces'],['missions','Mes missions']].map(([k,l]) => (
          <TouchableOpacity key={k} style={[s.tab, tab===k&&s.tabOn]} onPress={() => setTab(k)}>
            <Text style={[s.tabTxt, tab===k&&s.tabTxtOn]}>{l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? <ActivityIndicator style={{marginTop:40}} color={COLORS.primary}/> : (
        <ScrollView contentContainerStyle={s.list}>
          {tab==='posts' && (
            posts.length === 0 ? <Text style={s.empty}>Aucune annonce disponible</Text> :
            posts.map(p => (
              <View key={p.id} style={s.card}>
                <View style={s.cardTop}>
                  <View style={s.catBadge}><Text style={s.catTxt}>{p.category||'Divers'}</Text></View>
                  <Text style={s.date}>{new Date(p.created_at).toLocaleDateString('fr-FR')}</Text>
                </View>
                <Text style={s.desc}>{p.description}</Text>
                <Text style={s.by}>Par : {p.posted_by_name}</Text>
                <TouchableOpacity style={s.acceptBtn} onPress={() => onAccept(p.id)}>
                  <Text style={s.acceptTxt}>Accepter cette mission</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
          {tab==='missions' && <Text style={s.empty}>Vos missions apparaîtront ici</Text>}
        </ScrollView>
      )}

      <Modal visible={showNew} animationType="slide" transparent>
        <View style={s.overlay}>
          <View style={s.modal}>
            <Text style={s.modalTitle}>Publier une annonce</Text>
            <Text style={s.modalSub}>Décrivez votre besoin. La catégorie est détectée automatiquement.</Text>
            <TextInput style={s.textarea} placeholder="Ex: Nettoyage 3 pièces à Bastos..."
              multiline value={desc} onChangeText={setDesc} placeholderTextColor={COLORS.textLight}
              textAlignVertical="top"/>
            <View style={s.modalBtns}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => { setShowNew(false); setDesc(''); }}>
                <Text style={s.cancelTxt}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.publishBtn} onPress={onPublish} disabled={posting}>
                {posting ? <ActivityIndicator color="#fff"/> : <Text style={s.publishTxt}>Publier</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container:{flex:1,backgroundColor:COLORS.bg},
  header:{backgroundColor:COLORS.white,flexDirection:'row',alignItems:'center',paddingTop:54,paddingBottom:14,paddingHorizontal:16,borderBottomWidth:1,borderBottomColor:COLORS.border,gap:12},
  back:{fontSize:28,color:COLORS.primary},
  title:{flex:1,fontSize:18,fontWeight:'700',color:COLORS.text},
  newBtn:{backgroundColor:COLORS.primary,borderRadius:10,paddingHorizontal:14,paddingVertical:8},
  newTxt:{color:'#fff',fontWeight:'700',fontSize:13},
  warning:{backgroundColor:COLORS.redLight,paddingHorizontal:16,paddingVertical:10,borderBottomWidth:1,borderBottomColor:COLORS.red+'30'},
  warningTxt:{fontSize:11,color:COLORS.red,lineHeight:16},
  tabs:{flexDirection:'row',backgroundColor:COLORS.white,padding:8,gap:8},
  tab:{flex:1,paddingVertical:8,borderRadius:9,backgroundColor:COLORS.bg,alignItems:'center'},
  tabOn:{backgroundColor:COLORS.blue},
  tabTxt:{fontSize:13,fontWeight:'600',color:COLORS.textSub},
  tabTxtOn:{color:'#fff'},
  list:{padding:14,gap:12},
  empty:{textAlign:'center',color:COLORS.textSub,marginTop:40},
  card:{backgroundColor:COLORS.white,borderRadius:14,padding:16,borderWidth:1,borderColor:COLORS.border},
  cardTop:{flexDirection:'row',justifyContent:'space-between',marginBottom:8},
  catBadge:{backgroundColor:COLORS.primaryLight,borderRadius:8,paddingHorizontal:10,paddingVertical:3},
  catTxt:{color:COLORS.primary,fontSize:11,fontWeight:'700'},
  date:{fontSize:11,color:COLORS.textLight},
  desc:{fontSize:14,color:COLORS.text,lineHeight:20,marginBottom:8},
  by:{fontSize:11,color:COLORS.textSub,marginBottom:12},
  acceptBtn:{backgroundColor:COLORS.blue,borderRadius:10,paddingVertical:11,alignItems:'center'},
  acceptTxt:{color:'#fff',fontWeight:'700',fontSize:13},
  overlay:{flex:1,backgroundColor:'rgba(0,0,0,0.5)',justifyContent:'flex-end'},
  modal:{backgroundColor:COLORS.white,borderTopLeftRadius:20,borderTopRightRadius:20,padding:24},
  modalTitle:{fontSize:18,fontWeight:'800',color:COLORS.text,marginBottom:6},
  modalSub:{fontSize:13,color:COLORS.textSub,marginBottom:14,lineHeight:18},
  textarea:{backgroundColor:COLORS.bg,borderWidth:1,borderColor:COLORS.border,borderRadius:12,padding:14,fontSize:14,color:COLORS.text,minHeight:120,marginBottom:16},
  modalBtns:{flexDirection:'row',gap:10},
  cancelBtn:{flex:1,borderWidth:1,borderColor:COLORS.border,borderRadius:12,paddingVertical:13,alignItems:'center'},
  cancelTxt:{color:COLORS.textSub,fontWeight:'600'},
  publishBtn:{flex:1,backgroundColor:COLORS.primary,borderRadius:12,paddingVertical:13,alignItems:'center'},
  publishTxt:{color:'#fff',fontWeight:'700'},
});
