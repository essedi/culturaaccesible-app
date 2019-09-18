# culturaaccesible-app


<strong>IOS package bundle=  com.itbook.audioguias
ANDROID package bundle= com.essedi.itbook.audioguias</strong>

##Build with

<p>
ionic cordova build android --release 

jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore platforms/android/release/release-cultura-essedi.keystore platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk cultura_essedi

/usr/local/sdk-tools/build-tools/28.0.3/zipalign -v 4 platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk ../cultura_essedi-1.4.0.apk
</p>

##cordova background geolocation application key
<p>
Bundle ID:	
com.essedi.itbook.audioguias
License Key (>= v3.0.0):	
4e26645f31b51c3d4f6fe9bfe4c3dc77425668aa2186f17a66bfb12157802481
License Key (< v3.0.0):	
df66dcb6c0d7ecc6b36ef51e767f62f83b96d8c7c1930d5f2969b6e7d0c0d96d

</p>

