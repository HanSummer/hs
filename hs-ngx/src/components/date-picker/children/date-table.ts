import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges, AfterViewChecked, DoCheck, AfterContentChecked } from '@angular/core'
import { DateFormat } from '../utils/format'
import { getFirstDayOfMonth, getDayCountOfMonth, getWeekNumber, clearHours } from '../utils'

export type DateRowItem = {
  row?: number,
  column?: number,
  text?: number,
  type?: string,// current normal today prev-month next-month available
  disabled?: boolean,
  inRange?: boolean,
  start?: boolean,
  end?: boolean
}
export type DateRow = DateRowItem[]

export type RangeState = {
  beginDate: any,
  endDate: any,
  row: number,
  column: number,
  selecting: boolean
}

@Component({
  selector: 'hs-date-table',
  providers: [DateFormat],
  template: `
    <table class="el-date-table" cellspacing="0" cellpadding="0" (mousemove)="handleMouseMove($event)">
      <tbody>
      <tr>
        <th *ngFor="let week of weeks">{{week}}</th>
      </tr>
      <tr class="el-date-table__row"
          *ngFor="let row of tableRows">
        <td *ngFor="let item of row"
          [class]="getCellClasses(item)"
          (click)="clickHandle($event, item)">
          <div>
            <span>{{item.text}}</span>
          </div>
        </td>
      </tr>
      </tbody>
    </table>
  `,
})
export class ElDateTable implements OnInit, OnChanges, DoCheck, AfterContentChecked, AfterViewChecked {

  @Input('disabled-date') disabledDate: any
  @Input() selectionMode: string = 'day'
  @Input() showWeekNumber: boolean = false
  @Input() firstDayOfWeek: number = 7
  @Input() value: any = new Date()
  @Input() defaultValue: any = {} // null, valid Date object, Array of valid Date objects
  // @Input() date: any = {}
  @Input() rangeState: RangeState = {
    beginDate: null,
    endDate: null,
    selecting: false,
    row: null,
    column: null
  }
  @Output() modelChange: EventEmitter<any> = new EventEmitter<any>()
  @Output() changerange: EventEmitter<any> = new EventEmitter<any>()

  weeks: string[] = ['日', '一', '二', '三', '四', '五', '六']
  tableRows: DateRow[] = [[], [], [], [], [], []]

  date: Date
  _minDate: any = null
  _maxDate: any = null
  firstDayPosition: number

  get offsetDay() {
    const week = this.firstDayOfWeek;
    // 周日为界限，左右偏移的天数，3217654 例如周一就是 -1，目的是调整前两行日期的位置
    return week > 3 ? 7 - week : -week;
  }

  get year() {
    return this.date.getFullYear();
  }

  get month() {
    return this.date.getMonth();
  }

  get startDate() {
    return DateFormat.getStartDateOfMonth(this.year, this.month);
  }

  @Input()
  get minDate() {
    return null
  }
  set minDate(newVal) {
    this._minDate = newVal;
  }

  @Input()
  get maxDate() {
    return null
  }
  set maxDate(newVal) {
    this._maxDate = newVal;
  }

  @Input()
  get model(): Date {
    return new Date()
  }
  set model(newVal) {
    this.date = new Date(newVal);
    this.getRows()
  }

  ngOnInit(): void {
    this.getRows()
  }

  ngOnChanges(changes: SimpleChanges): void {

  }

  ngDoCheck() {

  }

  ngAfterContentChecked() {
    this.refreshMarkRange();
  }

  ngAfterViewChecked() {

  }

  /**
   * 刷新日期范围标记
   */
  refreshMarkRange() {
    if (!!this._minDate || !!this._maxDate) {
      this.markRange(this._minDate, this._maxDate)
    }
  }

  /**
   * 获取日期表格数据
   */
  getRows(): void {
    const date = new Date(this.year, this.month, 1);
    let day = getFirstDayOfMonth(date); // day of first day
    const dateCountOfMonth = getDayCountOfMonth(date.getFullYear(), date.getMonth());
    const dateCountOfLastMonth = getDayCountOfMonth(date.getFullYear(), (date.getMonth() === 0 ? 11 : date.getMonth() - 1));

    day = (day === 0 ? 7 : day);

    const offset = this.offsetDay;
    const rows = this.tableRows;
    let count = 1;
    let firstDayPosition;

    const startDate = this.startDate;
    const disabledDate = this.disabledDate;
    const now = clearHours(new Date());

    for (let i = 0; i < 6; i++) {
      const row = rows[i];

      if (this.showWeekNumber) {
        if (!row[0]) {
          row[0] = { type: 'week', text: getWeekNumber(DateFormat.nextDate(startDate, i * 7 + 1)) };
        }
      }

      for (let j = 0; j < 7; j++) {
        let cell = row[this.showWeekNumber ? j + 1 : j];
        if (!cell) {
          cell = {
            row: i,
            column: j,
            type: 'normal',
            inRange: false,
            start: false,
            end: false
          };
        }

        cell.type = 'normal';

        const index = i * 7 + j;
        const time = DateFormat.nextDate(startDate, index - offset).getTime();
        cell.inRange = time >= clearHours(this.minDate) && time <= clearHours(this.maxDate);
        cell.start = this.minDate && time === clearHours(this.minDate);
        cell.end = this.maxDate && time === clearHours(this.maxDate);
        const isToday = time === now;

        if (isToday) {
          cell.type = 'today';
        }

        if (i >= 0 && i <= 1) {
          if (j + i * 7 >= (day + offset)) {
            cell.text = count++;
            if (count === 2) {
              firstDayPosition = i * 7 + j;
            }
          } else {
            cell.text = dateCountOfLastMonth - (day + offset - j % 7) + 1 + i * 7;
            cell.type = 'prev-month';
          }
        } else {
          if (count <= dateCountOfMonth) {
            cell.text = count++;
            if (count === 2) {
              firstDayPosition = i * 7 + j;
            }
          } else {
            cell.text = count++ - dateCountOfMonth;
            cell.type = 'next-month';
          }
        }

        cell.disabled = typeof disabledDate === 'function' && disabledDate(new Date(time));

        row[this.showWeekNumber ? j + 1 : j] = cell;
      }

      if (this.selectionMode === 'week') {
        const start = this.showWeekNumber ? 1 : 0;
        const end = this.showWeekNumber ? 7 : 6;
        const isWeekActive = this.isWeekActive(row[start + 1]);

        row[start].inRange = isWeekActive;
        row[start].start = isWeekActive;
        row[end].inRange = isWeekActive;
        row[end].end = isWeekActive;
      }
    }

    this.firstDayPosition = firstDayPosition;

    this.tableRows = rows;

    this.refreshMarkRange();
  }

  /**
   * 判断元素是否有cls样式
   * @param el 
   * @param cls 
   */
  hasClass(el, cls) {
    if (!el || !cls) return false;
    if (cls.indexOf(' ') !== -1) throw new Error('className should not contain space.');
    if (el.classList) {
      return el.classList.contains(cls);
    } else {
      return (' ' + el.className + ' ').indexOf(' ' + cls + ' ') > -1;
    }
  }

  /**
   * 判断日期表格cell是否匹配某个日期
   * @param cell 
   * @param date 
   */
  cellMatchesDate(cell, date) {
    const value = new Date(date);
    return this.year === value.getFullYear() &&
      this.month === value.getMonth() &&
      Number(cell.text) === value.getDate();
  }

  /**
   * 动态设置表格cell样式
   * @param cell 
   */
  getCellClasses(cell) {
    const selectionMode = this.selectionMode;
    const defaultValue = this.defaultValue ? Array.isArray(this.defaultValue) ? this.defaultValue : [this.defaultValue] : [];

    let classes = [];
    if ((cell.type === 'normal' || cell.type === 'today') && !cell.disabled) {
      classes.push('available');
      if (cell.type === 'today') {
        classes.push('today');
      }
    } else {
      classes.push(cell.type);
    }

    if (cell.type === 'normal' && defaultValue.some(date => this.cellMatchesDate(cell, date))) {
      classes.push('default');
    }

    if (selectionMode === 'day' && (cell.type === 'normal' || cell.type === 'today') && this.cellMatchesDate(cell, this.value)) {
      classes.push('current');
    }

    if (cell.inRange && ((cell.type === 'normal' || cell.type === 'today') || this.selectionMode === 'week')) {
      classes.push('in-range');

      if (cell.start) {
        classes.push('start-date');
      }

      if (cell.end) {
        classes.push('end-date');
      }
    }

    if (cell.disabled) {
      classes.push('disabled');
    }

    return classes.join(' ');
  }

  /**
   * 根据表格行列获取单元格cell的日期
   * @param row 
   * @param column 
   */
  getDateOfCell(row, column) {
    const offsetFromStart = row * 7 + (column - (this.showWeekNumber ? 1 : 0)) - this.offsetDay;
    return DateFormat.nextDate(this.startDate, offsetFromStart);
  }

  /**
   * 是否激活单双周
   * @param cell 
   */
  isWeekActive(cell): boolean {
    if (this.selectionMode !== 'week') return false;
    const newDate = new Date(this.year, this.month, 1);
    const year = newDate.getFullYear();
    const month = newDate.getMonth();

    if (cell.type === 'prev-month') {
      newDate.setMonth(month === 0 ? 11 : month - 1);
      newDate.setFullYear(month === 0 ? year - 1 : year);
    }

    if (cell.type === 'next-month') {
      newDate.setMonth(month === 11 ? 0 : month + 1);
      newDate.setFullYear(month === 11 ? year + 1 : year);
    }

    newDate.setDate(parseInt(cell.text, 10));

    return getWeekNumber(newDate) === getWeekNumber(this.date);
  }

  /**
   * 标记日期范围：通过minDate,maxDate修改 tableRows 属性
   * 绑定表格数据 === rows ，修改rows时候调用getCellClasses
   * @param maxDate 
   */
  markRange(minDate, maxDate) {
    const startDate = this.startDate;
    const rows = this.tableRows;
    for (let i = 0, k = rows.length; i < k; i++) {
      const row = rows[i];
      for (let j = 0, l = row.length; j < l; j++) {
        if (this.showWeekNumber && j === 0) continue;

        const cell = row[j];
        const index = i * 7 + j + (this.showWeekNumber ? -1 : 0);
        // 获取当前单元格的时间戳
        const time = DateFormat.nextDate(startDate, index - this.offsetDay).getTime();

        cell.inRange = minDate && time >= clearHours(minDate) && time <= clearHours(maxDate);
        cell.start = minDate && time === clearHours(minDate.getTime());
        cell.end = maxDate && time === clearHours(maxDate.getTime());
      }
    }
  }

  /**
   * 处理日期选择点击事件
   * @param event 
   * @param item 
   */
  clickHandle(event: any, item?: DateRowItem): void {
    let target = event.target;
    if (target.tagName === 'SPAN') {
      target = target.parentNode.parentNode;
    }
    if (target.tagName === 'DIV') {
      target = target.parentNode;
    }

    if (target.tagName !== 'TD') return;
    if (this.hasClass(target, 'disabled') || this.hasClass(target, 'week')) return;

    const selectionMode = this.selectionMode;

    if (selectionMode === 'week') {
      target = target.parentNode.cells[1];
    }

    let year = Number(this.year);
    let month = Number(this.month);

    const cellIndex = target.cellIndex;
    const rowIndex = target.parentNode.rowIndex;

    const cell = this.tableRows[rowIndex - 1][cellIndex];
    const text = String(cell.text);
    const className = target.className;

    const newDate = new Date(year, month, 1);

    if (className.indexOf('prev') !== -1) {
      if (month === 0) {
        year = year - 1;
        month = 11;
      } else {
        month = month - 1;
      }
      newDate.setFullYear(year);
      newDate.setMonth(month);
    } else if (className.indexOf('next') !== -1) {
      if (month === 11) {
        year = year + 1;
        month = 0;
      } else {
        month = month + 1;
      }
      newDate.setFullYear(year);
      newDate.setMonth(month);
    }

    newDate.setDate(parseInt(text, 10));

    let clickRangeHandle = () => {
      if (this.rangeState.selecting) {
        this.modelChange.emit({
          minDate: this._minDate,
          maxDate: this._maxDate
        });
        this.rangeState = Object.assign({}, this.rangeState, {
          selecting: false
        });
        this._minDate = null;
        this._maxDate = null;
        this.changerange.emit({
          minDate: this._minDate,
          maxDate: this._maxDate,
          rangeState: this.rangeState
        });
      } else {
        const minDate = new Date(newDate.getTime());

        this.rangeState = Object.assign({}, this.rangeState, {
          beginDate: minDate,
          selecting: true,
          row: rowIndex - 1,
          column: cellIndex
        });
        this.changerange.emit({
          minDate,
          maxDate: this.maxDate,
          rangeState: this.rangeState
        });

        this.markRange(minDate, minDate);
      }
    }

    if (this.selectionMode === 'range') {
      clickRangeHandle();
    } else if (selectionMode === 'day') {
      this.modelChange.emit(newDate);
      this.markRange(newDate, newDate);
    } else if (selectionMode === 'week') {
      const weekNumber = getWeekNumber(newDate);
      const value = newDate.getFullYear() + 'w' + weekNumber;
      this.modelChange.emit({
        year: newDate.getFullYear(),
        week: weekNumber,
        value: value,
        date: newDate
      });
    }

  }

  /**
   * 处理表格鼠标移动事件
   * @param event 
   */
  handleMouseMove(event) {
    if (!this.rangeState.selecting) return;

    let target = event.target;
    if (target.tagName === 'SPAN') {
      target = target.parentNode.parentNode;
    }
    if (target.tagName === 'DIV') {
      target = target.parentNode;
    }
    if (target.tagName !== 'TD') return;

    const column = target.cellIndex;
    const row = target.parentNode.rowIndex - 1;
    const { row: oldRow, column: oldColumn, beginDate } = this.rangeState;
    let endDate = this.getDateOfCell(row, column);
    let minDate = beginDate, maxDate = endDate;
    if (beginDate > endDate) minDate = endDate, maxDate = beginDate;
    this.changerange.emit({
      minDate,
      maxDate
    });
  }

}
