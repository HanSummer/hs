import {
    Directive,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
    Injectable,
    Inject,
    PLATFORM_ID
} from '@angular/core';

import { isPlatformBrowser } from '@angular/common';

let _seed = 0;

@Injectable()
@Directive({ selector: '[clickOutside]' })
export class ClickOutsideDirective implements OnInit, OnChanges, OnDestroy {

    @Input() attachOutsideOnClick: boolean = false;
    @Input() delayClickOutsideInit: boolean = false;
    @Input() exclude: string = '';
    @Input() excludeBeforeClick: boolean = false;
    @Input() clickOutsideEvents: string = '';

    @Output() clickOutside: EventEmitter<Event> = new EventEmitter<Event>();

    private _nodesExcluded: Array<HTMLElement> = [];
    private _events: Array<string> = ['click'];


    constructor(private _el: ElementRef,
        @Inject(PLATFORM_ID) protected platformId: Object) {
        const id = _seed++;
        _el.nativeElement.COId = id;
        this._initOnClickBody = this._initOnClickBody.bind(this);
        this._onClickBody = this._onClickBody.bind(this);
    }

    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this._init();
        }
    }

    ngOnDestroy() {
        if (isPlatformBrowser(this.platformId)) {

            if (this.attachOutsideOnClick) {
                this._events.forEach(e => this._el.nativeElement.removeEventListener(e, this._initOnClickBody));
            }

            this._events.forEach(e => document.removeEventListener(e, this._onClickBody));
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (isPlatformBrowser(this.platformId)) {

            if (changes['attachOutsideOnClick'] || changes['exclude']) {
                this._init();
            }
        }
    }

    private _init() {
        if (this.clickOutsideEvents !== '') {
            this._events = this.clickOutsideEvents.split(' ');
        }

        this._excludeCheck();

        if (this.attachOutsideOnClick) {
            this._events.forEach(e => this._el.nativeElement.addEventListener(e, this._initOnClickBody));
        } else {
            this._initOnClickBody();
        }
    }

    private _initOnClickBody() {
        if (this.delayClickOutsideInit) {
            setTimeout(this._initClickListeners.bind(this));
        } else {
            this._initClickListeners();
        }
    }

    private _initClickListeners() {
        this._events.forEach(e => document.addEventListener(e, this._onClickBody));
    }

    private _excludeCheck() {
        if (this.exclude) {
            try {
                const nodes = Array.from(document.querySelectorAll(this.exclude)) as Array<HTMLElement>;
                if (nodes) {
                    this._nodesExcluded = nodes;
                }
            } catch (err) {
                console.error('[ng-click-outside] Check your exclude selector syntax.', err);
            }
        }
    }

    private _onClickBody(ev: Event) {
        if (this.excludeBeforeClick) {
            this._excludeCheck();
        }

        if (!this._isFatcher(this._el.nativeElement, ev.target) && !this._shouldExclude(ev.target)) {
            this.clickOutside.emit(ev);

            if (this.attachOutsideOnClick) {
                this._events.forEach(e => document.removeEventListener(e, this._onClickBody));
            }
        }
    }

    private _isFatcher(p, c2) {
        var c = c2;
        while (c.parentNode) {
            c = c.parentNode;
            if (c == p)
                return true;
        }
        return false;
    }

    private _shouldExclude(target): boolean {

        for (let excludedNode of this._nodesExcluded) {
            if (excludedNode.contains(target)) {
                return true;
            }
        }

        return false;
    }
}