import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { initExternalPayment } from './api';
import { COLORS } from './config';

export default function ExternalPayScreen({ navigation }) {
  const [step, setStep]       = useState(1);
  const [seller, setSeller]   = useState('');
  const [amount, setAmount]   = useState('');
  const [desc, setDesc]       = useState('');
  const [date, setDate]       = useState('');
  const [agency, setAgency]   = useState('');
  const [proofs, setProofs]   = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);

  async function onSubmit() {
    if (!seller||!amount) return Alert.alert('', 'Numéro WhatsApp du vendeur et montant requis');
    setLoading(true);
    try {
      const r = await initExternalPayment({
        seller_whatsapp_number: seller.replace(/\s/g,''),
        amount: parseInt(amount),
        description_text: desc,
        expected_delivery_date: date||null,
        travel_agency_estimate: agency,
        requested_proofs: proofs,
      });
      setResult(r); setStep(2);
    } catch(err) { Alert.alert('Erreur', err.message); }
    finally { setLoading(false); }
  }

  if (step === 1) return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={()=>navigation.goBack()}><Text style={s.back}>‹</Text></TouchableOpacity>
        <Text style={s.headerTitle}>🔐 Paiement sécurisé externe</Text>
      </View>
      <ScrollView contentContainerStyle={s.form}>
        <View style={s.infoBanner}>
          <Text style={s.infoTitle}>💡 Comment ça marche ?</Text>
          <Text style={s.infoText}>Vos fonds sont séquestrés chez Play16. Le vendeur reçoit un code de vérification. Une fois le colis reçu et confirmé, les fonds sont libérés.</Text>
        </View>
        <Text style={s.label}>Numéro WhatsApp du vendeur *</Text>
        <TextInput style={s.input} placeholder="237XXXXXXXXX" keyboardType="phone-pad" value={seller} onChangeText={setSeller} placeholderTextColor={COLORS.textLight}/>
        <Text style={s.label}>Montant à payer (FCFA) *</Text>
        <TextInput style={s.input} placeholder="Ex: 35000" keyboardType="number-pad" value={amount} onChangeText={setAmount} placeholderTextColor={COLORS.textLight}/>
        <Text style={s.label}>Description du produit</Text>
        <TextInput style={[s.input,s.textarea]} placeholder="Ex: Samsung A54 acheté sur Facebook" multiline value={desc} onChangeText={setDesc} placeholderTextColor={COLORS.textLight}/>
        <Text style={s.label}>Date estimée de réception</Text>
        <TextInput style={s.input} placeholder="JJ/MM/AAAA" value={date} onChangeText={setDate} placeholderTextColor={COLORS.textLight}/>
        <Text style={s.label}>Agence de transport estimée</Text>
        <TextInput style={s.input} placeholder="Ex: Garantie Express" value={agency} onChangeText={setAgency} placeholderTextColor={COLORS.textLight}/>
        <Text style={s.label}>Preuves souhaitées à la livraison</Text>
        <TextInput style={s.input} placeholder="Ex: reçu de l'agence, vidéo de déballage" value={proofs} onChangeText={setProofs} placeholderTextColor={COLORS.textLight}/>
        <TouchableOpacity style={s.btn} onPress={onSubmit} disabled={loading}>
          {loading?<ActivityIndicator color="#fff"/>:<Text style={s.btnTxt}>Confirmer et séquestrer le paiement</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  return (
    <View style={s.container}>
      <View style={s.header}><Text style={s.headerTitle}>🔐 Paiement séquestré</Text></View>
      <ScrollView contentContainerStyle={s.form}>
        <View style={s.successCard}>
          <Text style={s.successIcon}>🔐</Text>
          <Text style={s.successTitle}>Paiement séquestré !</Text>
          <Text style={s.successAmt}>{parseInt(amount).toLocaleString()} FCFA</Text>
          <Text style={s.successSub}>sécurisés chez Play16</Text>
        </View>
        <View style={s.tokenCard}>
          <Text style={s.tokenLabel}>Code de vérification pour le vendeur</Text>
          <Text style={s.token}>{result?.payment_token||'—'}</Text>
          <Text style={s.tokenSub}>Le vendeur entre ce code sur Play16 pour vérifier le paiement</Text>
          <Text style={s.tokenExpiry}>Valable {result?.token_expires_hours||48}h</Text>
        </View>
        <View style={s.stepsCard}>
          <Text style={s.stepsTitle}>Étapes suivantes :</Text>
          {['Le vendeur vérifie le paiement via Play16 avec votre code',
            'Il prépare et emballe votre commande',
            'Il vous expédie le colis',
            'Confirmez la réception dans Play16 → fonds libérés',
            'Sans réponse 24h après la date convenue → remboursement automatique'
          ].map((st,i)=><Text key={i} style={s.step}>{i+1}. {st}</Text>)}
        </View>
        <TouchableOpacity style={s.btn} onPress={()=>navigation.navigate('Commandes')}>
          <Text style={s.btnTxt}>Voir mes transactions</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container:{flex:1,backgroundColor:COLORS.white},
  header:{flexDirection:'row',alignItems:'center',paddingTop:54,paddingBottom:14,paddingHorizontal:16,borderBottomWidth:1,borderBottomColor:COLORS.border,gap:12},
  back:{fontSize:28,color:COLORS.primary},
  headerTitle:{fontSize:16,fontWeight:'700',color:COLORS.text,flex:1},
  form:{padding:20,gap:4},
  infoBanner:{backgroundColor:COLORS.goldLight,borderWidth:1,borderColor:COLORS.gold+'40',borderRadius:12,padding:14,marginBottom:16},
  infoTitle:{fontSize:13,fontWeight:'700',color:COLORS.gold,marginBottom:6},
  infoText:{fontSize:12,color:COLORS.textSub,lineHeight:18},
  label:{fontSize:13,fontWeight:'700',color:COLORS.text,marginBottom:6,marginTop:12},
  input:{backgroundColor:COLORS.bg,borderWidth:1,borderColor:COLORS.border,borderRadius:10,paddingHorizontal:14,paddingVertical:13,fontSize:14,color:COLORS.text},
  textarea:{minHeight:80,textAlignVertical:'top'},
  btn:{backgroundColor:COLORS.primary,borderRadius:13,paddingVertical:16,alignItems:'center',marginTop:20},
  btnTxt:{color:'#fff',fontWeight:'700',fontSize:15},
  successCard:{backgroundColor:COLORS.primaryLight,borderWidth:1,borderColor:COLORS.primaryBorder,borderRadius:16,padding:24,alignItems:'center',marginBottom:16},
  successIcon:{fontSize:48,marginBottom:8},
  successTitle:{fontSize:18,fontWeight:'800',color:COLORS.text},
  successAmt:{fontSize:28,fontWeight:'800',color:COLORS.primary,marginTop:4},
  successSub:{fontSize:13,color:COLORS.textSub},
  tokenCard:{backgroundColor:COLORS.greenLight,borderWidth:1,borderColor:COLORS.green+'40',borderRadius:14,padding:18,alignItems:'center',marginBottom:16},
  tokenLabel:{fontSize:12,color:COLORS.textSub,marginBottom:6},
  token:{fontSize:32,fontWeight:'800',color:COLORS.green,letterSpacing:4},
  tokenSub:{fontSize:11,color:COLORS.textSub,marginTop:8,textAlign:'center'},
  tokenExpiry:{fontSize:11,color:COLORS.red,marginTop:4,fontWeight:'600'},
  stepsCard:{backgroundColor:COLORS.bg,borderRadius:14,padding:16,marginBottom:16},
  stepsTitle:{fontSize:13,fontWeight:'700',color:COLORS.text,marginBottom:10},
  step:{fontSize:12,color:COLORS.textSub,lineHeight:20,marginBottom:6},
});
