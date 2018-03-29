import { Component, EventEmitter, Input, OnChanges, OnInit, Optional, Output, SimpleChanges } from '@angular/core'
import { ElDatePicker } from '../picker'
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

export type DateModelItem = {
  month: number,
  year: number,
  yearRange: number[],
}

@Component({
  selector: 'el-data-picker-panel',
  animations: [dropAnimation],
  styleUrls: ['./range-picker-panel.css'],
  templateUrl: './picker-panel.html'
})
export class ElDatePickerPanel implements OnInit, OnChanges {

  @Input() show: boolean = false
  @Input() width: number
  @Input() model: any
  @Input('hidden-day') hiddenDay: boolean = false
  @Input('panel-absolute') panelAbsolute: boolean = true
  @Input('panel-index') panelIndex: number = 200
  @Output() modelChange: EventEmitter<any> = new EventEmitter<any>()

  @Input() shortcuts: boolean = false
  showTime: boolean = false
  currentView: string = 'date'
  dateShowModels: DateModelItem

  constructor(
    @Optional() public root: ElDatePicker,
  ) {
  }

  ngOnInit(): void {
    this.currentView = this.hiddenDay ? 'month' : 'date'
    this.model = new Date(this.model || Date.now())
    this.updateDate()
  }

  ngOnChanges(changes: SimpleChanges): void {

  }

  /**
   * 日期头部年月切换
   * @param pickPath 
   */
  showPicker(pickPath: string): void {
    this.currentView = pickPath
  }

  /**
   * 日期头部模型数据绑定
   */
  updateDate(): void {
    const date: Date = new Date(this.model)
    const startYear: number = ~~(date.getFullYear() / 10) * 10
    this.dateShowModels = {
      month: date.getMonth(),
      year: date.getFullYear(),
      yearRange: [startYear, startYear + 10],
    }
  }

  /**
   * date table 组件交互
   * @param time 
   */
  datePickChangeHandle(time: any): void {
    this.model = time
    this.modelChange.emit({ value: time })
    this.updateDate()
  }

  /**
   * month table 组件交互
   * @param time 
   */
  monthPickChangeHandle(time: number): void {
    this.model = time
    if (this.hiddenDay) {
      this.modelChange.emit(time)
    } else {
      this.currentView = 'date'
    }
    this.updateDate()
  }

  /**
   * year table 组件交互
   * @param time 
   */
  yearPickChangeHandle(time: number): void {
    this.model = time
    this.currentView = 'month'
    this.updateDate()
  }

  /**
   * 上个月 按钮事件处理
   */
  prevMonth() {
    this.model = prevMonth(this.model);
    this.updateDate()
  }

  /**
   * 下个月 按钮事件处理
   */
  nextMonth() {
    this.model = nextMonth(this.model);
    this.updateDate()
  }

  /**
   * 上一年 按钮事件处理
   */
  prevYear() {
    if (this.currentView === 'year') {
      this.model = prevYear(this.model, 10);
    } else {
      this.model = prevYear(this.model);
    }
    this.updateDate()
  }

  /**
   * 下一年 按钮事件处理
   */
  nextYear() {
    if (this.currentView === 'year') {
      this.model = nextYear(this.model, 10);
    } else {
      this.model = nextYear(this.model);
    }
    this.updateDate()
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
    if (Array.isArray(val)) return;
    this.model = val;
    this.modelChange.emit({ value: val });
  }

}
