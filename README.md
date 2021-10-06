# Custom Hook Implementation

Files live in `scripts/android`.

Update `LauncherActivity.java` to use the correct package for your file (should match your bundle ID).

Update `update-launcher.js` `LAUNCHER_DESTINATION` to the correct path where the new java file should live. Typically, the path should be a folder representation of your bundle ID. ex:

```text
io.ionic.starter -> .../io/ionic/starter
com.mycustom.app.bundle.id -> .../com/mycustom/app/bundle/id
```

This location should already exist if you have your android platform created and it should already contain a `MainActivity.java` file.

Lastly, register the hook in your `config.xml` by adding the following line to your Android platforms section

```xml
<hook src="scripts/android/update-launcher.js" type="after_platform_add" />
```
