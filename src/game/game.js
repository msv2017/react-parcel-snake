import React, { Component, Fragment } from 'react';
import './game.scss';

import hamburger from '../icons/hamburger.svg';
import snakeHead from '../icons/snake-head.svg';
import snakeBody from '../icons/snake-body.svg';

const empty = (size) => [...Array(size).fill(null)];

const FOOD = 1;
const SNAKE_HEAD = 100;
const SNAKE_BODY = 101;

const [DIR_UP, DIR_DOWN, DIR_LEFT, DIR_RIGHT] = ['up', 'down', 'left', 'right'];

const directions = {
    [DIR_UP]: {
        angles: [0, 360, -360],
        vector: { x: 0, y: -1 },
        keys: ['ArrowUp', 'KeyW'],
        opposite: DIR_DOWN
    },
    [DIR_DOWN]: {
        angles: [-180, 180],
        vector: { x: 0, y: 1 },
        keys: ['ArrowDown', 'KeyS'],
        opposite: DIR_UP
    },
    [DIR_LEFT]: {
        angles: [-90, 270],
        vector: { x: -1, y: 0 },
        keys: ['ArrowLeft', 'KeyA'],
        opposite: DIR_RIGHT
    },
    [DIR_RIGHT]: {
        angles: [-270, 90],
        vector: { x: 1, y: 0 },
        keys: ['ArrowRight', 'KeyD'],
        opposite: DIR_LEFT
    }
}

class Game extends Component {
    constructor(props) {
        super(props);

        this.state = this.getDefaultState();
        this.foodTimer = window.setInterval(this.generateFood, 3000);
        this.moveTimer = window.setTimeout(this.moveDir, this.state.speed);
        document.addEventListener('keydown', this.keyDown);
    }

    getDefaultState = () => {
        const cols = this.props.cols || 15;
        const rows = this.props.rows || 15;
        const grid = empty(cols * rows);
        const head = { x: 7, y: 7 };
        grid[head.x + head.y * rows] = SNAKE_HEAD;

        return {
            cols,
            rows,
            head,
            tail: [],
            dir: DIR_UP,
            prevDir: DIR_UP,
            grid,
            speed: 1000,
            burgers: 0,
            dirAngle: 0,
            isRotating: false,
            isGameOver: false
        };
    }

    keyDown = (e) => {
        if (this.state.isGameOver) {
            if (e.code === 'Space') {
                this.setState(this.getDefaultState());
            }
            return;
        }

        const dir = Object.keys(directions)
            .filter(i => new Set(directions[i].keys).has(e.code))[0];
        const opposite = directions[this.state.dir].opposite;

        if (dir && dir !== opposite) {
            this.rotateSnake(dir);
        }
    }

    moveSnake = (from, to) => {
        const grid = this.state.grid.slice();
        const tail = this.state.tail.slice();
        let speed = this.state.speed;
        let burgers = this.state.burgers;
        let isGameOver = false;

        let item = this.getItem(to.x, to.y);
        switch (item) {
            case FOOD:
                tail.push(from);
                speed = speed - 50;
                if (speed < 250) {
                    speed = 250;
                }
                burgers += 1;
                break;
            case SNAKE_BODY:
                isGameOver = true;
                break;
            default:
                grid[this.getIndex(from.x, from.y)] = null;
                break;
        }

        if (tail.length > 0) {
            const last = tail.pop();
            tail.unshift(from);
            grid[this.getIndex(last.x, last.y)] = null;
            grid[this.getIndex(from.x, from.y)] = SNAKE_BODY;
        }

        grid[this.getIndex(to.x, to.y)] = SNAKE_HEAD;
        this.setState({ grid, tail, speed, burgers, isGameOver });
    }

    validatePos = (x, y) => ({
        x: (x + this.state.cols) % this.state.cols,
        y: (y + this.state.rows) % this.state.rows
    });

    moveDir = () => {
        this.moveTimer = window.setTimeout(this.moveDir, this.state.speed);

        if (this.state.isGameOver) {
            return;
        }

        const from = this.state.head;
        const dir = directions[this.state.dir].vector;
        const to = this.validatePos(from.x + dir.x, from.y + dir.y);
        this.setState(
            { head: to }
            , () => {
                this.moveSnake(from, to);
            });
    }

    rotateSnake = (dir) => {
        if (!this.state.isRotating && this.state.dir !== dir) {
            const angle = this.state.dirAngle;
            const closestAngle = directions[dir].angles
                .sort((a, b) => Math.abs(a - angle) - Math.abs(b - angle))[0];
            this.setState(
                {
                    dir,
                    prevDir: this.state.dir,
                    dirAngle: closestAngle,
                    isRotating: true,
                }, this.stopRotating);
        }
    }

    stopRotating = () => {
        window.setTimeout(() => {
            const dirAngle = Math.abs(this.state.dirAngle) === 360 ? 0 : this.state.dirAngle
            this.setState({ isRotating: false, dirAngle });
        }, 500);
    }

    generateFood = () => {
        if (this.state.isGameOver) {
            return;
        }

        const x = Math.random() * this.state.cols | 0;
        const y = Math.random() * this.state.rows | 0;
        const item = this.getItem(x, y)
        if (item === null) {
            this.setItem(x, y, FOOD);
        }
    }

    getIndex = (col, row) => col + row * this.state.rows;
    getItem = (col, row) => this.state.grid[this.getIndex(col, row)];

    setItem = (col, row, value) => {
        const grid = this.state.grid.slice();
        grid[col + row * this.state.rows] = value;
        this.setState({ grid });
    }

    renderItem = (col, row) => {
        const item = this.getItem(col, row);
        switch (item) {
            case FOOD:
                return <img className="food" src={hamburger} />;
            case SNAKE_HEAD:
                const css = Object.assign(
                    { transform: `rotate(${this.state.dirAngle}deg)` },
                    this.state.isRotating ? { transition: 'transform 0.5s' } : null);
                return <img
                    className={`snake-head`}
                    style={css}
                    src={snakeHead} />;
            case SNAKE_BODY:
                return <img
                    className={`snake-body`}
                    src={snakeBody} />;
            default:
                return null;
        }
    }

    render() {
        return (
            <Fragment>
                <div className="grid">
                    <div className="header">
                        <span>Speed:{this.state.speed}</span>
                        <span>Burgers:{this.state.burgers}</span>
                    </div>
                    {empty(this.state.rows).map((_, row) =>
                        <div
                            key={row}
                            className="row"
                        >
                            {empty(this.state.cols).map((_, col) =>
                                <div
                                    key={col}
                                    className="col"
                                >
                                    {this.renderItem(col, row)}
                                </div>
                            )}
                        </div>
                    )}
                    <div className="footer">
                        <span>Use ← → ↑ ↓ or W S A D to move</span>
                    </div>
                </div>
                {this.state.isGameOver &&
                    <div className="game-over">
                        <span>GAME OVER</span>
                        <span>Press SPACE to restart.</span>
                    </div>
                }
            </Fragment>
        );
    }
}

export default Game;