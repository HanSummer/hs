import { BrowserModule,  } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputModule } from '../components/input/input.module';
import { ElDateModule } from '../components/date-picker/module';
import { KindEditorModule } from '../components/kindeditor/kindeditor.module';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    BrowserModule,
    BrowserAnimationsModule,
    InputModule,
    ElDateModule,
    KindEditorModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
