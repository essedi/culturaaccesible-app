# culturaaccesible-app


if list exhibition list is not showing add  android:usesCleartextTraffic="true" in application tag of AndroidManifest.xml

 ios package bundle  com.itbook.audioguias
android package com.essedi.itbook.audioguias

<strong>Build with</strong>

<p>
ionic cordova build android --release 

jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore platforms/android/release/release-cultura-essedi.keystore platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk cultura_essedi

/usr/local/sdk-tools/build-tools/28.0.3/zipalign -v 4 platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk ../cultura_essedi-1.3.3.apk
</p>



