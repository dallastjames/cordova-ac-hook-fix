package io.ionic.starter;

import android.content.Intent;
import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;

public class LauncherActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if(isTaskRoot()) {
            Intent i = new Intent(this, MainActivity.class);
            startActivity(i);
        }

        finish();
    }
}