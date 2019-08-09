# culturaaccesible-app


--------------------------------

$root_dir/plugins/cordova-plugin-background-mode/plugin.xml delete line
<engine name="windows-sdk" version=">=10.0.14393.0" />
run: ionic cordova platform rm android ; ionic cordova platform add android

----------------------------------

ios package bundle  com.itbook.audioguias
android package com.essedi.itbook.audioguias

<strong>Build with</strong>

<p>
ionic cordova build android --release 

jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore platforms/android/release/release-cultura-essedi.keystore platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk cultura_essedi

/usr/local/sdk-tools/build-tools/28.0.3/zipalign -v 4 platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk ../cultura_essedi-1.3.9.apk
</p>



