import {
  AfterViewInit, Component, ContentChild, ElementRef, forwardRef, OnInit, TemplateRef,
  ViewChild,
} from '@angular/core';
import { SafeStyle, DomSanitizer } from '@angular/platform-browser';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputProps } from './input.props';
import { getTextareaHeight, isParentTag } from './util';


@Component({
  selector: 'hs-input',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => Input),
    multi: true
  }],
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css']
})
export class Input extends InputProps implements OnInit, AfterViewInit, ControlValueAccessor {

  @ContentChild('prepend') prepend: TemplateRef<any>
  @ContentChild('append') append: TemplateRef<any>
  @ViewChild('textarea') textarea: any
  textareaStyles: SafeStyle

  constructor(
    private sanitizer: DomSanitizer,
    private el: ElementRef
  ) {
    super()
  }

  makeTextareaStyles(): void {
    if (!this.autosize || this.type !== 'textarea') return
    const height: string = getTextareaHeight(this.textarea.nativeElement, this.autosize.minRows, this.autosize.maxRows)
    const styles: string = `resize: ${this.resize}; height: ${height};`
    this.textareaStyles = this.sanitizer.bypassSecurityTrustStyle(styles)
  }

  handleInput(val: string): void {
    this.model = val
    this.modelChange.emit(val)
    this.controlChange(val)
    const timer: any = setTimeout(() => {
      this.makeTextareaStyles()
      clearTimeout(timer)
    }, 0)
  }

  showPointer(): boolean {
    const clickEvent: boolean = !!(this.iconClick.observers && this.iconClick.observers.length)
    const mouseEvent: boolean = !!(this.iconMousedown.observers && this.iconMousedown.observers.length)

    return clickEvent || mouseEvent
  }

  ngOnInit(): void {
    if (this.value && !this.model) {
      this.model = this.value
    }
  }

  ngAfterViewInit(): any {
    // no content required
    if (this.type === 'textarea') {
      return setTimeout(() => {
        this.makeTextareaStyles()
      }, 0)
    }
  }

  writeValue(value: any): void {
    this.model = value
  }

  registerOnChange(fn: Function): void {
    this.controlChange = fn
  }

  registerOnTouched(fn: Function): void {
    this.controlTouch = fn
  }

  private controlChange: Function = () => { }
  private controlTouch: Function = () => { }
}