import { Component, forwardRef, OnDestroy, OnInit, Renderer2, ViewChild, ElementRef, Input } from '@angular/core'
import { ElDatePickerProps } from './picker-props'
import { DateFormat } from './utils/format'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import { ElDateRangePickerPanel } from './panel/range-picker-panel';

@Component({
  selector: 'hs-date-picker',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ElDatePicker),
      multi: true
    },
    DateFormat
  ],
  templateUrl: './picker.html',
  styleUrls: ['./picker.css'],
})
export class ElDatePicker extends ElDatePickerProps implements OnInit, OnDestroy, ControlValueAccessor {

  showPanelPicker: boolean = false
  iconShowClose: boolean = false
  value: any
  globalKeydownListener: Function
  @Input('range-separator')
  rangeSeparator: string = '至';
  @ViewChild('picker')
  picker: ElementRef;
  @ViewChild('dateRangePicker')
  dateRangePicker: ElDateRangePickerPanel

  get inputClass(): string {
    return 'el-date-editor ' + 'el-date-editor--' + this.type;
  }

  private controlChange: Function = () => { }
  private controlTouch: Function = () => { }

  constructor(
    private dateFormat: DateFormat,
    private renderer: Renderer2,
  ) {
    super()
  }

  /**
   * 初始化model value
   */
  ngOnInit(): void {
    // init value
    const time: number = this.dateFormat.getTime(this.model)
    if (!time) return
    this.model = DateFormat.moment(time, this.format)
    this.value = time
  }

  ngOnDestroy(): void {
    this.globalKeydownListener && this.globalKeydownListener()
  }

  /**
   * 外部点击事件处理
   * @param e 
   */
  onClickedOutside(e: Event) {
    let flag = true, _e: any = e;
    if (_e.path) {
      for (let i = 0; i <= _e.path.length; i++) {
        if (_e.path[i].nodeType === 9) break;
        if (_e.path[i].className === 'picker-wraped' && _e.path[i].COId === this.picker.nativeElement.COId) {
          flag = false;
          break;
        }
      }
    }
    if (!this.showPanelPicker || !flag) return
    this.showPanelPicker = false
    this.changeOnBlur && this.tryUpdateText()
    if (this.type === 'daterange') this.dateRangePicker.handleClear();
  }

  /**
   * 图标移入、移除事件处理
   * @param t 
   */
  iconMouseActionHandle(t: boolean): void {
    if (!this.clearable) return
    this.iconShowClose = this.model && t
  }

  /**
   * 图标点击事件处理
   * @param e 
   */
  iconClickHandle(e: Event): void {
    this.iconClick.emit(e)
    if (this.elDisabled) return
    if (this.iconShowClose) {
      this.clearClick.emit(e)
      this.model = null
      this.value = Date.now()
      this.showPanelPicker = false
      this.iconShowClose = false
      if (this.type === 'daterange') this.dateRangePicker.handleClear();
      return
    }
    this.showPanelPicker = !this.showPanelPicker
  }

  /**
   * 输入框的model属性改变处理
   * @param input 
   */
  changeHandle(input: string): void {
    const time: number = this.dateFormat.getTime(input)
    this.value = time
  }

  /**
   * 输入框value属性改变处理
   */
  tryUpdateText(): void {
    if (!this.value) {
      this.model = null
      this.modelChange.emit(null)
      this.controlChange(null)
      this.showPanelPicker = false
      return
    }
    const modelTime: number = new Date(this.model).getTime()
    const time: number = this.dateFormat.getTime(this.value)
    this.dateChangeHandle(time ? this.value : modelTime)
  }

  /**
   * 日期改变处理程序
   * @param time 
   */
  dateChangeHandle(val: any): void {
    let isRange = Array.isArray(val.value),
      beginDate, endDate, date;
    if (isRange) {
      beginDate = DateFormat.moment(val.value[0], this.format),
        endDate = DateFormat.moment(val.value[1], this.format);
      this.model = `${beginDate} ${this.rangeSeparator} ${endDate}`
      this.value = [beginDate, endDate]
    } else {
      date = val.value
      this.model = DateFormat.moment(date, this.format)
      this.value = new Date(this.model)
    }

    this.modelChange.emit(this.model)
    this.controlChange(this.model)
    this.showPanelPicker = false
  }

  /**
   * 输入框聚焦事件处理
   */
  focusHandle(): void {
    this.showPanelPicker = true
    this.globalKeydownListener && this.globalKeydownListener()
    this.globalKeydownListener = this.renderer.listen(
      'document', 'keydown', (event: KeyboardEvent) => {
        // 9 Tab; 27 Esc
        if (event.keyCode === 9 || event.keyCode === 27) {
          this.showPanelPicker = false
          this.globalKeydownListener && this.globalKeydownListener()
        }
        // 13 Enter
        if (event.keyCode === 13) {
          this.tryUpdateText()
        }
      })
  }

  /**
   * 输入框失焦事件处理
   */
  blurHandle() {

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

}
