import React, { useRef, useState, useEffect, useCallback } from 'react';
import { BackHandler, Linking, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { WebView } from 'react-native-webview';

// Change this to open a specific page (e.g. the feeds / outlook page) on launch.
const START_URL = 'https://lockerz-ea.pages.dev';
const SITE_HOST = 'lockerz-ea.pages.dev';

export default function App() {
  const webRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [failed, setFailed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack && webRef.current) {
        webRef.current.goBack();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [canGoBack]);

  const onShouldStart = useCallback((req) => {
    try {
      const host = new URL(req.url).hostname;
      if (host === SITE_HOST || host.endsWith('.' + SITE_HOST)) return true;
    } catch (e) {}
    if (req.url.startsWith('http') || req.url.startsWith('tg:') || req.url.startsWith('mailto:')) {
      Linking.openURL(req.url).catch(() => {});
      return false;
    }
    return true;
  }, []);

  const reload = () => {
    setFailed(false);
    setRefreshing(true);
    webRef.current && webRef.current.reload();
  };

  if (failed) {
    return (
      <View style={styles.center}>
        <StatusBar style="light" />
        <Text style={styles.title}>No connection</Text>
        <Text style={styles.sub}>Check your internet and try again.</Text>
        <TouchableOpacity style={styles.btn} onPress={reload}>
          <Text style={styles.btnText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" backgroundColor="#000000" />
      <ScrollView
        contentContainerStyle={{ flex: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={reload} enabled={!canGoBack ? true : true} />}
        scrollEnabled={false}
      >
        <WebView
          ref={webRef}
          source={{ uri: START_URL }}
          style={styles.web}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          setSupportMultipleWindows={false}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.center}><ActivityIndicator size="large" color="#d4af37" /></View>
          )}
          onNavigationStateChange={(s) => setCanGoBack(s.canGoBack)}
          onShouldStartLoadWithRequest={onShouldStart}
          onLoadEnd={() => setRefreshing(false)}
          onError={() => { setRefreshing(false); setFailed(true); }}
          onHttpError={() => {}}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000', paddingTop: 28 },
  web: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 8 },
  sub: { color: '#9aa0a6', fontSize: 15, marginBottom: 20, textAlign: 'center' },
  btn: { backgroundColor: '#d4af37', paddingHorizontal: 28, paddingVertical: 12, borderRadius: 10 },
  btnText: { color: '#000', fontSize: 16, fontWeight: '700' },
});
