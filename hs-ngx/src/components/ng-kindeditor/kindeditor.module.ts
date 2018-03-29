import { NgModule, ModuleWithProviders, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgKindEditor } from './kindeditor'

/**
 * 基于kindeditor @version 4.1.10 (2014-06-10)
 * @author Roddy <luolonghao@gmail.com>
 * @website http://www.kindsoft.net/
 * @licence http://www.kindsoft.net/license.php
 * Update By xiahl (2018-03-29)
 */

@NgModule({
    declarations: [
        NgKindEditor
    ],
    exports: [
        NgKindEditor
    ],
    imports: [
        CommonModule,
        FormsModule
    ],
    schemas: [NO_ERRORS_SCHEMA]
})
export class KindEditorModule {
    static forRoot(): ModuleWithProviders {
        return { ngModule: KindEditorModule, providers: [] }
    }
}
