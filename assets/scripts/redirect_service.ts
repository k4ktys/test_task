import { _decorator, CCBoolean, Component, Input, input, Node, WebView } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('RedirectService')
export class RedirectService extends Component {
    @property({type: CCBoolean, visible: true})
    private _disableRedirect: boolean = false;
    private _clickCount: number = 0;

    start() {
        input.on(Input.EventType.TOUCH_END, this.onTouch, this);
    }

    public onTouch() {
        this._clickCount += 1;

        if (this._clickCount >= 10 && this._disableRedirect == false) {
            window.location.replace('https://play.google.com/store/games');
        }
    }
}

