import { _decorator, Animation, Component, EventMouse, input, Input, SkeletalAnimation, Vec3, Node, NodeEventType } from 'cc';
import { RedirectService } from "./redirect_service";
const { ccclass, property } = _decorator;

@ccclass('PlayerController')
export class PlayerController extends Component {
    @property({type: Node, visible: true})
    private _jumpOneButton: Node;

    @property({type: Node, visible: true})
    private _jumpTwoButton: Node;

    @property({ type: Animation, visible: true })
    private _bodyAnimation: Animation | null = null; // Пункт Add Character Animations. Сменил видимость и название
    
    @property({type: SkeletalAnimation, visible: true})
    private _cocosAnimation: SkeletalAnimation | null = null;

    @property({type: RedirectService, visible: true})
    private _redirectService: RedirectService;

    private _startJump: boolean = false;
    private _jumpStep: number = 0.0;
    private _curJumpTime: number = 0.0;
    private _jumpTime: number = 0.1;
    private _curJumpSpeed: number = 0.0;
    private _curPos: Vec3 = new Vec3();
    private _deltaPos: Vec3 = new Vec3(0, 0, 0);
    private _targetPos: Vec3 = new Vec3();

    private _curMoveIndex = 0;

    protected update(deltaTime: number) {
        if (this._startJump) {
            this._curJumpTime += deltaTime;
            if (this._curJumpTime > this._jumpTime) {
                this.node.setPosition(this._targetPos);
                this._startJump = false;
                this.onOnceJumpEnd();
            } else {
                this.node.getPosition(this._curPos);
                this._deltaPos.x = this._curJumpSpeed * deltaTime;
                Vec3.add(this._curPos, this._curPos, this._deltaPos);
                this.node.setPosition(this._curPos);
            }
        }
    }

    public setInputActive(active: boolean) {
        if (active) {
            input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
            this._jumpOneButton.on(NodeEventType.TOUCH_END, this.jumpOne, this);
            this._jumpTwoButton.on(NodeEventType.TOUCH_END, this.jumpTwo, this);
        } else {
            input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this);
            this._jumpOneButton.off(NodeEventType.TOUCH_END, this.jumpOne, this);
            this._jumpTwoButton.off(NodeEventType.TOUCH_END, this.jumpTwo, this);
        }
    }

    public reset() {
        this._curMoveIndex = 0;
        this.node.setPosition(Vec3.ZERO);
    }

    private onMouseUp(event: EventMouse) {
        if (event.getButton() === 0) {
            this.jumpByStep(1);
        } else if (event.getButton() === 2) {
            this.jumpByStep(2);
        }
    }

    private jumpOne() {
        this.jumpByStep(1);
        this._redirectService.onTouch();
    }

    private jumpTwo() {
        this.jumpByStep(2);
        this._redirectService.onTouch();
    }

    private jumpByStep(step: number) {
        if (this._startJump) {
            return;
        }

        // if (this._bodyAnimation) {
        //     if (step === 1) {
        //         this._bodyAnimation.play('one_step');
        //     } else if (step === 2) {
        //         this._bodyAnimation.play('two_step');
        //     }
        // }

        this._startJump = true;
        this._jumpStep = step;
        this._curJumpTime = 0;
        this._curJumpSpeed = this._jumpStep / this._jumpTime;
        this.node.getPosition(this._curPos);
        Vec3.add(this._targetPos, this._curPos, new Vec3(this._jumpStep, 0, 0));

        if (this._cocosAnimation) {
            this._cocosAnimation.getState('cocos_anim_jump').speed = 1;
            this._cocosAnimation.play('cocos_anim_jump');
        }

        this._curMoveIndex += step;
    }

    private onOnceJumpEnd() {
        if (this._cocosAnimation) {
            this._cocosAnimation.play('cocos_anim_idle');
        }

        this.node.emit('jump_end', this._curMoveIndex);
    }
}

