# culturaaccesible-app


if list exhibition list is not showing add  android:usesCleartextTraffic="true" in application tag of AndroidManifest.xml

 ios package bundle  com.itbook.audioguias
android package com.essedi.itbook.audioguias

<strong>Build with</strong>

<p>

If the build fails on adroid:: 

**NODE VERSION** v10.13.0

Set in project structure: 

Android Gradle Plugin version to 3.3.0

actualizar en dependencias a esto :

"org.altbeacon:android-beacon-library:2.19	implementation"
"commons-io:commons-io:20030203.000550	implementation"
"com.google.android.gms:play-services-location:18.0.0	implementation"
 
 en androidmanifestxml
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
<uses-permission android:name="android.permission.BLUETOOTH_ADVERTISE" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
<uses-permission android:name="android.permission.BLUETOOTH_SCAN" />

en build.gradle para que android acepte la subida...(habrá que actualizar in app purchase, si se usa claro...)

  implementation "com.android.billingclient:billing:5.0.0" 



 java version 1.8 (JAVA 8) y especificar en settings, gradle lacation "Specified location" y jdk 1.8


HAcer build en andorid studio con los cambios // ionic cordova build android --release 

jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore release-cultura-essedi.keystore platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk cultura_essedi

/usr/local/sdk-tools/build-tools/28.0.3/zipalign -v 4 platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk ../cultura_essedi-1.3.3.apk
</p>

In case you try to biuld adn it fails due to node-ssass not found:
Download github version 5: 
wget https://github.com/sass/node-sass/releases/download/v5.0.0/linux-x64-83_binding.node
export SASS_BINARY_PATH=~/somepath/linux-x64-11_binding.node


Add this package when npm i and then rename it to to `cordova-plugin-ibeacon` (Based on docs of the plugin) 
    "com.unarin.cordova.beacon": "^3.8.1",

