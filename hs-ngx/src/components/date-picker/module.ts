import { NgModule, ModuleWithProviders } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { InputModule } from '../input/input.module'
import { ClickOutsideModule } from '../click-outside'
import { ElDatePicker } from './picker'
import { ElDatePickerPanel } from './panel/picker-panel'
import { ElDateRangePickerPanel } from './panel/range-picker-panel'
import { ElDateTable } from './children/date-table'
import { ElYearTable } from './children/year-table'
import { EMonthTable } from './children/month-table'

@NgModule({
  declarations: [ElDatePicker, ElDatePickerPanel, ElDateRangePickerPanel, ElDateTable, ElYearTable, EMonthTable],
  exports: [ElDatePicker, ElDatePickerPanel, ElDateRangePickerPanel, ElDateTable, ElYearTable, EMonthTable],
  imports: [CommonModule, FormsModule, InputModule, ClickOutsideModule],
  entryComponents: [ElDatePicker],
})
export class ElDateModule {
  static forRoot(): ModuleWithProviders {
    return { ngModule: ElDateModule, providers: [] }
  }
}
