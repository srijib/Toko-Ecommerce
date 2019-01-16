#!/bin/bash

jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore tokomyfriends.jks -keypass 0f434b08-896e-11e7-9ff1-0a580a780014 ./platforms/android/build/outputs/apk/android-release-unsigned.apk tokomyfriends
~/Library/Android/sdk/build-tools/26.0.1/zipalign -v 4 ./platforms/android/build/outputs/apk/android-release-unsigned.apk TokoMyFriends-2.2.0.apk
~/Library/Android/sdk/build-tools/26.0.1/apksigner verify TokoMyFriends-2.2.0.apk
