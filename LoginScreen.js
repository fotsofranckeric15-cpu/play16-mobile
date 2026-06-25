import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { requestOTP, verifyOTP, saveToken, saveUser } from './api';
import { COLORS } from './config';

export default function LoginScreen({ navigation }) {
  const [phone, setPhone]     = useState('');
  const [loading, setLoading] = useState(false);

  async function onSendOTP() {
    const cleaned = phone.replace(/\s/g, '');
    if (cleaned.length < 9) return Alert.alert('Erreur', 'Numéro invalide');
    setLoading(true);
    try {
      const result = await requestOTP(cleaned);
      navigation.navigate('OTP', { phone: cleaned, simulated: result.simulated });
    } catch (err) { Alert.alert('Erreur', err.message); }
    finally { setLoading(false); }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.logoSection}>
          <View style={s.logoIcon}><Text style={s.logoP}>P</Text></View>
          <Text style={s.logoLabel}>PLAY <Text style={{color:COLORS.primary}}>16</Text></Text>
          <Text style={s.logoSub}>Marketplace · Cash-Work · Paiement sécurisé</Text>
        </View>
        <Text style={s.title}>Connexion</Text>
        <Text style={s.subtitle}>Entrez votre numéro pour recevoir un code WhatsApp</Text>
        <View style={s.inputRow}>
          <View style={s.prefixBox}><Text style={s.prefix}>+237</Text></View>
          <TextInput style={s.input} placeholder="6XX XXX XXX" keyboardType="phone-pad"
            value={phone} onChangeText={setPhone} placeholderTextColor={COLORS.textLight} maxLength={9}/>
        </View>
        <TouchableOpacity style={s.btn} onPress={onSendOTP} disabled={loading}>
          {loading ? <ActivityIndicator color={COLORS.white}/> : <Text style={s.btnText}>Recevoir mon code WhatsApp</Text>}
        </TouchableOpacity>
        <Text style={s.note}>En continuant, vous accepterez les CGU de Play16.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function OTPScreen({ route, navigation }) {
  const { phone, simulated } = route.params;
  const [code, setCode]       = useState('');
  const [loading, setLoading] = useState(false);

  async function onVerify() {
    if (code.length !== 6) return Alert.alert('Erreur', 'Code à 6 chiffres requis');
    setLoading(true);
    try {
      const result = await verifyOTP(phone, code);
      await saveToken(result.token); await saveUser(result.user);
      if (result.needs_cgu_acceptance) navigation.replace('CGU', { version: result.cgu_version });
      else navigation.replace('Main');
    } catch { Alert.alert('Code incorrect', 'Code invalide ou expiré.'); }
    finally { setLoading(false); }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={s.back} onPress={()=>navigation.goBack()}>
          <Text style={s.backText}>‹ Retour</Text>
        </TouchableOpacity>
        <Text style={s.title}>Vérification</Text>
        <Text style={s.subtitle}>Code envoyé par WhatsApp au{'\n'}<Text style={{fontWeight:'700',color:COLORS.text}}>+237 {phone}</Text></Text>
        {simulated && (
          <View style={s.simBanner}>
            <Text style={s.simText}>⚠️ Mode simulation — Consultez les logs Railway Console pour voir le code.</Text>
          </View>
        )}
        <TextInput style={[s.input,s.codeInput]} placeholder="000000" keyboardType="number-pad"
          value={code} onChangeText={setCode} maxLength={6} textAlign="center" placeholderTextColor={COLORS.textLight}/>
        <TouchableOpacity style={s.btn} onPress={onVerify} disabled={loading}>
          {loading ? <ActivityIndicator color={COLORS.white}/> : <Text style={s.btnText}>Confirmer</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={s.resendBtn} onPress={()=>requestOTP(phone)}>
          <Text style={s.resendText}>Renvoyer le code</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container:{flex:1,backgroundColor:COLORS.white},
  scroll:{flexGrow:1,padding:24,paddingTop:60},
  logoSection:{alignItems:'center',marginBottom:40},
  logoIcon:{width:72,height:72,borderRadius:20,backgroundColor:COLORS.primary,justifyContent:'center',alignItems:'center',marginBottom:12},
  logoP:{color:COLORS.white,fontWeight:'900',fontSize:36},
  logoLabel:{fontSize:30,fontWeight:'800',color:COLORS.text},
  logoSub:{fontSize:12,color:COLORS.textSub,marginTop:6,textAlign:'center'},
  title:{fontSize:24,fontWeight:'800',color:COLORS.text,marginBottom:8},
  subtitle:{fontSize:14,color:COLORS.textSub,marginBottom:24,lineHeight:20},
  inputRow:{flexDirection:'row',gap:8,marginBottom:16},
  prefixBox:{backgroundColor:COLORS.bg,borderWidth:1,borderColor:COLORS.border,borderRadius:10,paddingHorizontal:14,justifyContent:'center'},
  prefix:{fontSize:15,fontWeight:'700',color:COLORS.text},
  input:{flex:1,backgroundColor:COLORS.bg,borderWidth:1,borderColor:COLORS.border,borderRadius:10,paddingHorizontal:14,paddingVertical:14,fontSize:16,color:COLORS.text},
  codeInput:{flex:0,fontSize:30,fontWeight:'800',letterSpacing:8,paddingVertical:18,marginBottom:16,textAlign:'center'},
  btn:{backgroundColor:COLORS.primary,borderRadius:13,paddingVertical:16,alignItems:'center',marginBottom:12},
  btnText:{color:COLORS.white,fontSize:16,fontWeight:'700'},
  resendBtn:{alignItems:'center',paddingVertical:12},
  resendText:{color:COLORS.primary,fontSize:14,fontWeight:'600'},
  simBanner:{backgroundColor:COLORS.goldLight,borderWidth:1,borderColor:COLORS.gold+'40',borderRadius:10,padding:12,marginBottom:16},
  simText:{fontSize:12,color:COLORS.gold,lineHeight:18},
  note:{fontSize:12,color:COLORS.textLight,textAlign:'center',marginTop:16},
  back:{marginBottom:24},
  backText:{fontSize:16,color:COLORS.primary,fontWeight:'600'},
});
