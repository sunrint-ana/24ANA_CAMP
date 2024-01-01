import { Engine, Render, Runner, Bodies, World, Body, Sleeping, Events } from "matter-js";
import FRUITS from "./fruits";

// TODO: Matter.js의 엔진을 생성하세요.
// engine 상수에 엔진을 생성해 할당하세요.
const engine = Engine.create();

const render = Render.create({
	engine,
	element: document.body,
	options: {
		wireframes: false,
		background: "#F7F4C8",
		width: 620,
		height: 700,
	},
});

// TODO: 엔진에 월드를 추가하세요.
// world 상수에 월드를 추가해 할당하세요.
const world = engine.world;

const ground = Bodies.rectangle(310, 700, 620, 60, {
	isStatic: true,
	render: {
		fillStyle: "#E6B143",
	},
});
const leftWall = Bodies.rectangle(15, 395, 30, 790, {
	isStatic: true,
	render: {
		fillStyle: "#E6B143",
	},
});
const rightWall = Bodies.rectangle(605, 395, 30, 790, {
	isStatic: true,
	render: {
		fillStyle: "#E6B143",
	},
});
const topLine = Bodies.rectangle(310, 120, 620, 2, {
	isStatic: true,
	isSensor: true,
	render: { fillStyle: "#E6B143" },
	label: "topLine",
});

// TODO: 위에서 생성한 world에 땅, 왼쪽 벽, 오른쪽 벽, 위쪽 선을 추가하세요.
World.add(world, [ground, leftWall, rightWall, topLine]);

Render.run(render);

// TODO: Render.run 함수에 engine을 전달해 호출하세요.
Runner.run(engine);

let currentBody = null;
let currentFruit = null;
let interval = null;
let disableAction = false;
let num_suika = 0;
let isOver = false;

function getRandomFruit() {
	const randomIndex = Math.floor(Math.random() * 5);
	const fruit = FRUITS[randomIndex];

	if (currentFruit && currentFruit.label === fruit.label) return getRandomFruit();

	return fruit;
}

function addCurrentFruit() {
	// TODO: randomFruit 상수에 어떤 함수를 호출해야 랜덤한 과일을 가져올 수 있을까요?
	const randomFruit = getRandomFruit();

	const body = Bodies.circle(300, 50, randomFruit.radius, {
		label: randomFruit.label,
		isSleeping: true,
		render: {
			fillStyle: randomFruit.color,
			sprite: { texture: `/${randomFruit.label}.png` },
		},
		restitution: 0.2,
	});

	currentBody = body;
	currentFruit = randomFruit;

	// TODO: world에 body를 추가하세요.
	World.add(world, [body]);
}

window.onkeydown = (event) => {
	if (disableAction) return;

	switch (event.code) {
		case "ArrowLeft":
			if (interval) return;
			interval = setInterval(() => {
				if (currentBody.position.x - 20 > 30)
					Body.setPosition(currentBody, {
						x: currentBody.position.x - 1,
						y: currentBody.position.y,
					});
			}, 5);
			break;
		case "ArrowRight":
			if (interval) return;
			interval = setInterval(() => {
				if (currentBody.position.x + 20 < 590)
					Body.setPosition(currentBody, {
						x: currentBody.position.x + 1,
						y: currentBody.position.y,
					});
			}, 5);
			break;
		case "Space":
			disableAction = true;
			Sleeping.set(currentBody, false);
			setTimeout(() => {
				addCurrentFruit();
				disableAction = false;
			}, 1000);
	}
};

window.onkeyup = (event) => {
	switch (event.code) {
		case "ArrowLeft":
		case "ArrowRight":
			clearInterval(interval);
			interval = null;
	}
};

Events.on(engine, "collisionStart", (event) => {
	event.pairs.forEach((collision) => {
		if (collision.bodyA.label === collision.bodyB.label) {
			World.remove(world, [collision.bodyA, collision.bodyB]);

			const index = FRUITS.findIndex((fruit) => fruit.label === collision.bodyA.label);

			if (index === FRUITS.length - 1) return;

			const newFruit = FRUITS[index + 1];
			const body = Bodies.circle(collision.collision.supports[0].x, collision.collision.supports[0].y, newFruit.radius, {
				render: {
					fillStyle: newFruit.color,
					sprite: { texture: `/${newFruit.label}.png` },
				},
				label: newFruit.label,
			});
			World.add(world, body);
			if (newFruit.label == "watermelon") {
				num_suika++;
			}
		}
		if (!isOver && (collision.bodyA.label === "topLine" || collision.bodyB.label === "topLine") && !disableAction) {
			alert("Game over");
			window.location.reload();
		}

		// TODO: 게임 승리 조건을 작성하세요.
		// num_suika에는 수박의 개수가 들어있어요.
		// 수박이 하나 이상 만들어졌고 isOver 변수가 false일 때 게임을 승리하게 해주세요.
		if (num_suika >= 1 && !isOver) {
			isOver = true;
			setTimeout(function () {
				const windows = Bodies.rectangle(310, 300, 620, 150, {
					isStatic: true,
					render: {
						fillStyle: "#E6B143",
					},
				});

				const result = document.getElementById("result");
				result.innerText = "Victory";
				World.add(world, [ground, leftWall, rightWall, topLine, windows]);
				alert("Victory");
				window.location.reload();
			}, 100);
		}
	});
});

addCurrentFruit();
