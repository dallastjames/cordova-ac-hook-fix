var ANDROID_PROJECT_ROOT = "platforms/android/app/src/main";
var LAUNCHER_DESTINATION =
  "platforms/android/app/src/main/java/io/ionic/starter";
var LAUNCHER_SOURCE = "scripts/android/LauncherActivity.java";
var fs = require("fs");
var path = require("path");
var xml2js = require("xml2js");

function copyJavaLauncher() {
  return new Promise((resolve, reject) => {
    fs.access(LAUNCHER_DESTINATION, (err) => {
      if (err) {
        reject("INVALID LAUNCHER DESTINATION");
        return;
      }
      copyFile(
        LAUNCHER_SOURCE,
        path.join(LAUNCHER_DESTINATION, "LauncherActivity.java")
      );
    });
  });
}

function copyFile(src, dest) {
  return new Promise((resolve, reject) => {
    let readStream = fs.createReadStream(src);

    readStream.once("error", (err) => {
      reject(err);
    });

    readStream.once("end", () => {
      resolve("done");
    });

    readStream.pipe(fs.createWriteStream(dest));
  });
}

function readManifest() {
  return new Promise((resolve, reject) => {
    fs.readFile(
      path.join(ANDROID_PROJECT_ROOT, "AndroidManifest.xml"),
      "utf-8",
      (err, input) => {
        if (!!err) {
          reject(err);
        } else {
          resolve(input);
        }
      }
    );
  });
}

function writeManifest(data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(
      path.join(ANDROID_PROJECT_ROOT, "AndroidManifest.xml"),
      data,
      (err) => {
        if (!!err) {
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
}

function convertToJson(input) {
  return new Promise((resolve, reject) => {
    xml2js.parseString(input, (err, result) => {
      if (!!err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

function convertToXML(input) {
  return new Promise((resolve, reject) => {
    let builder = new xml2js.Builder();
    let xml = builder.buildObject(input);
    resolve(xml);
  });
}

function removeLegacyActivityIntent(data) {
  return new Promise((resolve, reject) => {
    let applications = data.manifest.application;
    if (!applications) {
      reject();
      return;
    }
    applications.forEach((application) => {
      if (!!application.activity) {
        application.activity.forEach((activity) => {
          if (activity["intent-filter"]) {
            activity["intent-filter"].forEach((intent, idx) => {
              let shouldRemove = false;
              if (intent.action) {
                intent.action.forEach((action) => {
                  if (action["$"]["android:name"].includes("MAIN")) {
                    shouldRemove = true;
                  }
                });
              }
              if (shouldRemove) {
                delete activity["intent-filter"][idx];
              }
            });
          }
        });
      }
    });
    resolve(data);
  });
}

function addLauncherActivityIntent(data) {
  return new Promise((resolve, reject) => {
    let applications = data.manifest.application;
    if (!applications) {
      reject();
      return;
    }
    applications.forEach((application) => {
      if (typeof application.activity === "undefined") {
        application.activity = [];
      }
      application.activity.push({
        $: {
          "android:name": "LauncherActivity",
          "android:label": "@string/app_name",
          "android:theme": "@android:style/Theme.DeviceDefault.NoActionBar",
        },
        "intent-filter": [
          {
            action: {
              $: {
                "android:name": "android.intent.action.MAIN",
              },
            },
            category: {
              $: {
                "android:name": "android.intent.category.LAUNCHER",
              },
            },
          },
        ],
      });
    });
    resolve(data);
  });
}

module.exports = function (context) {
  return new Promise((resolve, reject) => {
    console.log("CONTEXT", context);
    readManifest()
      .then((input) => convertToJson(input))
      .then((data) => removeLegacyActivityIntent(data))
      .then((data) => addLauncherActivityIntent(data))
      .then((data) => convertToXML(data))
      .then((input) => writeManifest(input))
      .then(() => copyJavaLauncher())
      .then((data) => {
        resolve("done");
      })
      .catch((err) => {
        console.log(err);
        reject("done");
      });
  });
};
