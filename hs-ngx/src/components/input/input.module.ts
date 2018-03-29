import { NgModule, ModuleWithProviders } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Input } from './input.component'
import { FormsModule } from '@angular/forms'

@NgModule({
  declarations: [Input],
  exports: [Input],
  imports: [CommonModule, FormsModule],
  entryComponents: [Input],
})
export class InputModule {

}