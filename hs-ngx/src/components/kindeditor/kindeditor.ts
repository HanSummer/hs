import {
  Component,
  forwardRef,
  OnDestroy,
  OnInit,
  AfterViewInit,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';
import { KindEditorProps } from './kindeditor.props';

declare var window;

@Component({
  selector: 'hs-kindeditor',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NgKindEditor),
      multi: true
    }
  ],
  templateUrl: './kindeditor.html',
  styleUrls: ['./kindeditor.css']
})
export class NgKindEditor extends KindEditorProps implements OnInit, AfterViewInit, OnDestroy, ControlValueAccessor {

  private controlChange: Function = () => { }
  private controlTouch: Function = () => { }

  /**
   * kindeditor必要条件：id在当前页面必须是唯一的值。
   * @link(http://kindeditor.net/docs/usage.html)
   */
  id: string = '';
  
  /**
   * kindeditor根据id创建的editor实例
   */
  editor: any = null;

  /**
   * content 代表kindeditor插件的内容
   */
  get content() {
    return null;
  }
  set content(val) {
    if (this.editor && val !== this.outContent) this.outContent = val;
  };

  /**
   * outContent 代表该组件与其父组件的双向绑定内容
   */
  get outContent() {
    return null;
  }
  set outContent(val) {
    this.controlChange(val);
  }

  constructor() {
    super()
  }

  ngOnInit(): void {
    this.id = 'editor_id_' + this.genNonDuplicateID();
  }

  ngAfterViewInit(): void {
    this.initEditor();
  }

  ngOnDestroy(): void {
    this.removeEditor();
  }

  /**
   * 移除Editor
   */
  removeEditor() {
    window.KindEditor.remove('#' + this.id)
  }

  /**
   * 初始化Editor
   */
  initEditor() {
    let that = this, initOptions = {
      width: this.width,
      height: this.height,
      minWidth: this.minWidth,
      minHeight: this.minHeight,
      items: this.items,
      noDisableItems: this.noDisableItems,
      filterMode: this.filterMode,
      htmlTags: this.htmlTags,
      wellFormatMode: this.wellFormatMode,
      resizeType: this.resizeType,
      themeType: this.themeType,
      langType: this.langType,
      designMode: this.designMode,
      fullscreenMode: this.fullscreenMode,
      basePath: this.basePath,
      themesPath: this.cssPath,
      pluginsPath: this.pluginsPath,
      langPath: this.langPath,
      minChangeSize: this.minChangeSize,
      urlType: this.urlType,
      newlineTag: this.newlineTag,
      pasteType: this.pasteType,
      dialogAlignType: this.dialogAlignType,
      shadowMode: this.shadowMode,
      zIndex: this.zIndex,
      useContextmenu: this.useContextmenu,
      syncType: this.syncType,
      indentChar: this.indentChar,
      cssPath: this.cssPath,
      cssData: this.cssData,
      bodyClass: this.bodyClass,
      colorTable: this.colorTable,
      afterCreate: this.afterCreate,
      afterChange: function () {
        that.content = this.html();
      },
      afterTab: this.afterTab,
      afterFocus: this.afterFocus,
      afterBlur: this.afterBlur,
      afterUpload: this.afterUpload,
      uploadJson: this.uploadJson,
      fileManagerJson: this.fileManagerJson,
      allowPreviewEmoticons: this.allowPreviewEmoticons,
      allowImageUpload: this.allowImageUpload,
      allowFlashUpload: this.allowFlashUpload,
      allowMediaUpload: this.allowMediaUpload,
      allowFileUpload: this.allowFileUpload,
      allowFileManager: this.allowFileManager,
      fontSizeTable: this.fontSizeTable,
      imageTabIndex: this.imageTabIndex,
      formatUploadUrl: this.formatUploadUrl,
      fullscreenShortcut: this.fullscreenShortcut,
      extraFileUploadParams: this.extraFileUploadParams,
      filePostName: this.filePostName,
      fillDescAfterUploadImage: this.fillDescAfterUploadImage,
      afterSelectFile: this.afterSelectFile,
      pagebreakHtml: this.pagebreakHtml,
      allowImageRemote: this.allowImageRemote,
      autoHeightMode: this.autoHeightMode,
      fixToolBar: this.fixToolBar
    }
    this.removeEditor();
    this.editor = window.KindEditor.create('#' + this.id, initOptions);
  }

  /**
   * 生成随机数
   * 引入时间戳 随机数前置 36进制 加入随机数长度控制
   * @param randomLength 
   */
  genNonDuplicateID(randomLength?) {
    return Number(Math.random().toString().substr(3, randomLength) + Date.now()).toString(36)
  }

  /**
   * 父组件的value写入
   * @param value 
   */
  writeValue(value: any): void {
    this.outContent = value;
    if (this.editor) this.editor.html(value);
  }

  /**
   * 注册变化检测处理程序：把outContent发射给父组件
   * @param fn 
   */
  registerOnChange(fn: Function): void {
    this.controlChange = fn
  }

  registerOnTouched(fn: Function): void {
    this.controlTouch = fn
  }

}