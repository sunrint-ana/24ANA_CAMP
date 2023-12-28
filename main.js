import { Engine, Render, Runner, Bodies, World, Body, Sleeping, Events } from "matter-js";
import FRUITS from "./fruits";
const engine = Engine.create();
// const engine = Engine.create(); 한줄 빈칸
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

const world = engine.world;
// const world = engine.world; 한줄 빈칸

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

World.add(world, [ground, leftWall, rightWall, topLine]);
// World.add(world, [ground, leftWall, rightWall, topLine]);

Render.run(render);
Runner.run(engine);
// Runner.run(engine);

let currentBody = null;
let currentFruit = null;
let interval = null;
let disableAction = false;
let num_suika = 0;
let isOver = false

function addCurrentFruit() {
	const randomFruit = getRandomFruit();
	// const randomFruit = (); 함수명 빈칸

	const body = Bodies.circle(300, 50, randomFruit.radius, {
		label: randomFruit.label,
		isSleeping: true,
		render: {
			fillStyle: randomFruit.color,
			sprite: { texture: `/${randomFruit.label}.png` },
			//sprite: { texture: `/${}.png` },
		},
		restitution: 0.2,
	});

	currentBody = body;
	currentFruit = randomFruit;

	World.add(world, body);
	// World.add(world, body);
}

function getRandomFruit() {
	const randomIndex = Math.floor(Math.random() * 5);
	const fruit = FRUITS[randomIndex];

	if (currentFruit && currentFruit.label === fruit.label) return getRandomFruit();

	return fruit;
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

			// If last fruit, do nothing
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
			if (newFruit.label == "apple") {
				num_suika++;
			}
		}
		if (!isOver && (collision.bodyA.label === "topLine" || collision.bodyB.label === "topLine") && !disableAction) {
			alert("Game over");
			window.location.reload();
		}
		if (num_suika == 1 && !isOver) {
		// if ( && !isOver) {
			isOver = true;
			setTimeout(function () {
				alert("Victory");
				window.location.reload();
			}, 100);
		}
	});
});

addCurrentFruit();
