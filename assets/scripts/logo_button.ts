import { _decorator, Component, Node, NodeEventType } from 'cc';
import { RedirectService } from "./redirect_service";
const { ccclass, property } = _decorator;

@ccclass('LogoButton')
export class LogoButton extends Component {
    start() {
        this.node.on(NodeEventType.TOUCH_END, this.onClick, this);
    }

    private onClick() {
        window.location.replace('https://play.google.com/store/games');
    }
}

