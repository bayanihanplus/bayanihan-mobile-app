import React, { useRef } from "react";
import { View, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";

export default function GoogleLoginWeb({ onSuccess }: any) {
  const injectedJS = `
    function handleCredentialResponse(response) {
      window.ReactNativeWebView.postMessage(JSON.stringify(response));
    }
  `;

  const htmlContent = `
    <html>
      <head>
        <script src="https://accounts.google.com/gsi/client" async defer></script>
        <style>
          body { 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            height: 100vh; 
            margin: 0; 
          }
        </style>
      </head>
      <body>
        <div id="g_id_onload"
          data-client_id="YOUR_GOOGLE_CLIENT_ID"
          data-callback="handleCredentialResponse">
        </div>

        <div class="g_id_signin"
          data-type="standard"
          data-shape="rectangular"
          data-theme="outline"
          data-text="signin_with"
          data-size="large">
        </div>
      </body>

      <script>
        ${injectedJS}
      </script>
    </html>
  `;

  return (
    <View style={{ height: 60 }}>
      <WebView
        source={{ html: htmlContent }}
        onMessage={(event) => {
          const data = JSON.parse(event.nativeEvent.data);
          onSuccess(data.credential);
        }}
        javaScriptEnabled={true}
        originWhitelist={["*"]}
        mixedContentMode="always"
        style={{ backgroundColor: "transparent" }}
      />
    </View>
  );
}
