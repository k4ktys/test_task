import { _decorator, CCInteger, Component, instantiate, Label, Node, Prefab, Vec3 } from 'cc';
import { PlayerController } from "./player_controller";
const { ccclass, property } = _decorator;

enum BlockType {
    BT_NONE,
    BT_STONE,
};

enum GameState {
    GS_INIT,
    GS_PLAYING,
    GS_END,
};

@ccclass('GameManager')
export class GameManager extends Component {
    @property({ type: Prefab, visible: true }) // Пункт Runway upgrade. Сменил название и видимость
    private _cubePrefab: Prefab | null = null;

    @property({ type: CCInteger, visible: true }) // Пункт Runway upgrade. Сменил название и видимость
    private _roadLength: number = 50;

    @property({ type: PlayerController, visible: true }) // Пункт Add Game States. Сменил название и видимость
    private _playerController: PlayerController | null = null;

    @property({ type: Node, visible: true }) // Пункт Add Game States. Сменил название и видимость
    private _startMenu: Node | null = null;

    @property({ type: Label, visible: true })
    private _stepsLabel: Label | null = null;

    private _road: BlockType[] = [];

    protected start() {
        this.setState(GameState.GS_INIT);
        this._playerController.node.on('jump_end', this.onPlayerJumpEnd, this);
    }

    public setState(value: GameState) { // В оригинале пункта Add Game States
        switch (value) {                // тут было поле сеттер с этой все мудреной логикой,
            case GameState.GS_INIT:     // я вынес это все в отдельный метод
                this.init();
                break;
            case GameState.GS_PLAYING:
                if (this._startMenu) {
                    this._startMenu.active = false;
                }

                if (this._stepsLabel) {
                    this._stepsLabel.string = '0';
                }

                setTimeout(() => {
                    if (this._playerController) {
                        this._playerController.setInputActive(true);
                    }
                }, 0.1);
                break;
            case GameState.GS_END:
                break;
        }
    }

    private init() {
        if (this._startMenu) {
            this._startMenu.active = true;
        }

        this.generateRoad();

        if (this._playerController) {
            this._playerController.setInputActive(false);

            // Перенес в reset. Пункт Add game over logic 
            // this._playerController.node.setPosition(Vec3.ZERO);

            this._playerController.reset();
        }
    }

    private onPlayerJumpEnd(moveIndex: number) {
        if (this._stepsLabel) {
            // тоже переделал из туторила, так как счетчик при бесконечной генерации ломается
            this._stepsLabel.string = moveIndex.toString()
        }

        this.checkResult(moveIndex);
        
        for (let i = 0; i < 2; i++) {
            this.generateNewRoadBlocks();
        }
    }

    private onStartButtonClicked() {
        this.setState(GameState.GS_PLAYING);
    }

    private generateRoad() {
        this.node.removeAllChildren();
        this._road = [];
        this._road.push(BlockType.BT_STONE);

        for (let i = 1; i < this._roadLength; i++) {

            if (this._road[i - 1] === BlockType.BT_NONE) {
                this._road.push(BlockType.BT_STONE);
            } else {
                this._road.push(Math.floor(Math.random() * 2));
            }
        }


        for (let j = 0; j < this._road.length; j++) {
            let block: Node = this.spawnBlockByType(this._road[j]);

            if (block) {
                this.node.addChild(block);
                block.setPosition(j, -1.5, 0);
            }
        }
    }

    // Добавление новых блоков(бесконечная генерация) при срабатывание ивента jump_end
    private generateNewRoadBlocks() {
        const pos: number = this._road.length - 1;

        if (this._road[pos] === BlockType.BT_NONE) {
            this._road.push(BlockType.BT_STONE);
        } else {
            this._road.push(Math.floor(Math.random() * 2));
        }

        let block: Node = this.spawnBlockByType(this._road[pos]);

        if (block) {
            this.node.addChild(block);
            block.setPosition(pos, -1.5, 0);
        }
    }

    private spawnBlockByType(type: BlockType) {
        if (!this._cubePrefab) {
            return null;
        }

        let block: Node | null = null;

        switch (type) {
            case BlockType.BT_STONE:
                block = instantiate(this._cubePrefab);
                break;
        }

        return block;
    }

    //Метод из туториала переделан, что бы игра не завершалась на финише, а генерировались платформы бесконечно
    private checkResult(moveIndex: number) {
        if (this._road[moveIndex] == BlockType.BT_NONE) {
            this.setState(GameState.GS_INIT);
        }
    }
}

