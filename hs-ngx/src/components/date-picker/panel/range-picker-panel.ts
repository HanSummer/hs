import { Component, EventEmitter, Input, OnChanges, OnInit, Optional, Output, SimpleChanges, ViewEncapsulation } from '@angular/core'
import { dropAnimation } from '../../shared/animation'
import {
  formatDate,
  parseDate,
  isDate,
  modifyDate,
  modifyTime,
  prevYear,
  nextYear,
  prevMonth,
  nextMonth,
  extractDateFormat,
  extractTimeFormat
} from '../utils'

@Component({
  selector: 'hs-date-range-picker-panel',
  animations: [dropAnimation],
  styleUrls: ['./range-picker-panel.css'],
  templateUrl: './range-picker-panel.html',
  encapsulation: ViewEncapsulation.None
})
export class ElDateRangePickerPanel implements OnInit, OnChanges {

  @Input() show: boolean = false
  @Input() width: number = 646;
  // @Input() model: Array<string> = [];
  @Input('hidden-day') hiddenDay: boolean = false
  @Input('panel-absolute') panelAbsolute: boolean = true
  @Input('panel-index') panelIndex: number = 200
  @Output() modelChange: EventEmitter<any> = new EventEmitter<any>()
  @Input() unlinkPanels: boolean = false
  @Input() enableYearArrow: boolean = true
  @Input() enableMonthArrow: boolean = true

  @Input() shortcuts: boolean = false
  showTime: boolean = false
  currentView: string = 'date'

  leftDate: Date = new Date()
  rightDate: Date = nextMonth(new Date())
  minDate: any
  maxDate: any
  defaultValue: any
  defaultTime: any
  /** 日期范围状态 */
  rangeState: any = {
    beginDate: null,
    endDate: null,
    selecting: false,
    row: null,
    column: null
  }

  get leftLabel() {
    return this.leftDate.getFullYear() + ' ' + '年' + ' ' + (this.leftDate.getMonth() + 1) + ' ' + '月';
  }

  get rightLabel() {
    return this.rightDate.getFullYear() + ' ' + '年' + ' ' + (this.rightDate.getMonth() + 1) + ' ' + '月';
  }

  @Input('model')
  get value() {
    return [];
  }
  set value(newVal) {
    if (!newVal) {
      this.minDate = null;
      this.maxDate = null;
    } else if (Array.isArray(newVal)) {
      this.minDate = isDate(newVal[0]) ? new Date(newVal[0]) : null;
      this.maxDate = isDate(newVal[1]) ? new Date(newVal[1]) : null;
      if (this.minDate) {
        this.leftDate = this.minDate;
        if (this.unlinkPanels && this.maxDate) {
          const minDateYear = this.minDate.getFullYear();
          const minDateMonth = this.minDate.getMonth();
          const maxDateYear = this.maxDate.getFullYear();
          const maxDateMonth = this.maxDate.getMonth();
          this.rightDate = minDateYear === maxDateYear && minDateMonth === maxDateMonth
            ? nextMonth(this.maxDate)
            : this.maxDate;
        } else {
          this.rightDate = nextMonth(this.leftDate);
        }
      } else {
        this.leftDate = this.calcDefaultValue(this.defaultValue)[0];
        this.rightDate = nextMonth(this.leftDate);
      }
    }
  }

  constructor() {

  }

  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges): void {

  }

  private advanceDate = (date, amount) => {
    return new Date(new Date(date).getTime() + amount);
  };

  private calcDefaultValue = (defaultValue) => {
    if (Array.isArray(defaultValue)) {
      return [new Date(defaultValue[0]), new Date(defaultValue[1])];
    } else if (defaultValue) {
      return [new Date(defaultValue), this.advanceDate(defaultValue, 24 * 60 * 60 * 1000)];
    } else {
      return [new Date(), this.advanceDate(Date.now(), 24 * 60 * 60 * 1000)];
    }
  };

  private modifyWithGivenTime = (date, time) => {
    if (date == null || time == null) {
      return date;
    }
    time = parseDate(time, 'HH:mm:ss');
    return modifyTime(
      date,
      time.getHours(),
      time.getMinutes(),
      time.getSeconds()
    );
  };

  /**
   * 日期范围清除处理
   */
  handleClear() {
    this.minDate = null;
    this.maxDate = null;
    this.leftDate = this.calcDefaultValue(this.defaultValue)[0];
    this.rightDate = nextMonth(this.leftDate);
  }

  /**
   * 与子组件date table的纯属性交互
   * @param val 
   */
  handleChangeRange(val) {
    this.minDate = val.minDate;
    this.maxDate = val.maxDate;
    this.rangeState = Object.assign({}, this.rangeState, val.rangeState);
  }

  /**
   * 与子组件date table的交互：包含向外部发射事件 handleConfirm
   * @param val 
   * @param close 
   */
  datePickChangeHandle(val, close = true): void {
    const defaultTime = this.defaultTime || [];
    const minDate = this.modifyWithGivenTime(val.minDate, defaultTime[0]);
    const maxDate = this.modifyWithGivenTime(val.maxDate, defaultTime[1]);

    // if (this.maxDate === maxDate && this.minDate === minDate) return;

    this.maxDate = maxDate;
    this.minDate = minDate;
    this.rangeState = Object.assign({}, this.rangeState, val.rangeState);

    if (!close || this.showTime) return;

    this.handleConfirm();
  }

  /**
   * 日期范围选择确定处理
   * @param visible 
   */
  handleConfirm(visible = false) {
    this.modelChange.emit({
      value: [this.minDate, this.maxDate],
      visible: visible
    });
  }

  /**
   * 左边上一年 按钮事件处理
   */
  leftPrevYear() {
    this.leftDate = prevYear(this.leftDate);
    if (!this.unlinkPanels) {
      this.rightDate = nextMonth(this.leftDate);
    }
  }

  /**
   * 左边上一月 按钮事件处理
   */
  leftPrevMonth() {
    this.leftDate = prevMonth(this.leftDate);
    if (!this.unlinkPanels) {
      this.rightDate = nextMonth(this.leftDate);
    }
  }

  /**
   * 右边下一年 按钮事件处理
   */
  rightNextYear() {
    if (!this.unlinkPanels) {
      this.leftDate = nextYear(this.leftDate);
      this.rightDate = nextMonth(this.leftDate);
    } else {
      this.rightDate = nextYear(this.rightDate);
    }
  }

  /**
   * 右边下一月 按钮事件处理
   */
  rightNextMonth() {
    if (!this.unlinkPanels) {
      this.leftDate = nextMonth(this.leftDate);
      this.rightDate = nextMonth(this.leftDate);
    } else {
      this.rightDate = nextMonth(this.rightDate);
    }
  }

  // unlinkPanels === true
  leftNextYear() {
    this.leftDate = nextYear(this.leftDate);
  }

  leftNextMonth() {
    this.leftDate = nextMonth(this.leftDate);
  }

  rightPrevYear() {
    this.rightDate = prevYear(this.rightDate);
  }

  rightPrevMonth() {
    this.rightDate = prevMonth(this.rightDate);
  }

  /**
   * 处理快捷选项
   * @param fn 
   */
  handleShortcutClick(fn) {
    console.log(fn)
    if (fn.onClick) {
      fn.onClick(this);
    }
  }

  $emit(val, visible = false) {
    if (!Array.isArray(val)) return;
    this.value = val;
    this.rangeState = Object.assign({}, this.rangeState, {
      selecting: false
    });
    this.modelChange.emit({
      value: [this.minDate, this.maxDate],
      visible: visible
    });
  }

}
