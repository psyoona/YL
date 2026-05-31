/**
 * 알까기 게임 (Marble Flicking Game)
 * - 턴제: 플레이어1(파랑) vs 플레이어2(빨강, AI)
 * - 마우스 드래그로 방향/세기 조준 후 발사
 * - 상대 구슬을 보드 밖으로 밀어내면 제거
 */

const canvas = document.getElementById('marbleCanvas');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;
const RADIUS = 20;
const FRICTION = 0.985;
const MIN_VEL = 0.15;
const BORDER = RADIUS + 2;
const AI_DELAY = 600;

const PLAYER = { P1: 1, P2: 2 };

let marbles = [];
let turn = PLAYER.P1;
let gameOver = false;
let dragging = false;
let dragStart = null;
let dragCurrent = null;
let selectedMarble = null;
let animating = false;

function initGame() {
	marbles = [];
	gameOver = false;
	turn = PLAYER.P1;
	animating = false;
	dragging = false;
	dragStart = null;
	dragCurrent = null;
	selectedMarble = null;

	// 플레이어1(파랑) — 하단
	const p1Positions = [
		[150, 480], [200, 480], [250, 480], [300, 480],
		[175, 520], [225, 520], [275, 520], [325, 520],
	];
	// 플레이어2(빨강) — 상단
	const p2Positions = [
		[150, 120], [200, 120], [250, 120], [300, 120],
		[175,  80], [225,  80], [275,  80], [325,  80],
	];

	p1Positions.forEach(([x, y]) => marbles.push({ x, y, vx: 0, vy: 0, owner: PLAYER.P1 }));
	p2Positions.forEach(([x, y]) => marbles.push({ x, y, vx: 0, vy: 0, owner: PLAYER.P2 }));

	updateUI();
	render();
}

// ── UI ──────────────────────────────────────────────
function updateUI() {
	const p1 = marbles.filter(m => m.owner === PLAYER.P1).length;
	const p2 = marbles.filter(m => m.owner === PLAYER.P2).length;
	document.getElementById('p1Count').textContent = p1;
	document.getElementById('p2Count').textContent = p2;

	if (!gameOver) {
		const msg = turn === PLAYER.P1 ? '🔵 플레이어1의 차례 — 구슬을 드래그하여 발사' : '🔴 AI가 생각 중...';
		document.getElementById('turnMsg').textContent = msg;
	}
}

// ── 렌더링 ──────────────────────────────────────────
function render() {
	ctx.clearRect(0, 0, W, H);

	// 보드 배경
	ctx.fillStyle = '#2d5a1b';
	ctx.fillRect(0, 0, W, H);

	// 격자
	ctx.strokeStyle = 'rgba(255,255,255,0.07)';
	ctx.lineWidth = 1;
	for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
	for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

	// 테두리 경계선
	ctx.strokeStyle = 'rgba(255,255,200,0.4)';
	ctx.lineWidth = 3;
	ctx.strokeRect(BORDER, BORDER, W - BORDER * 2, H - BORDER * 2);

	// 조준선
	if (dragging && dragStart && dragCurrent && selectedMarble) {
		const dx = dragStart.x - dragCurrent.x;
		const dy = dragStart.y - dragCurrent.y;
		const power = Math.min(Math.hypot(dx, dy), 150);
		const angle = Math.atan2(dy, dx);

		ctx.save();
		ctx.setLineDash([8, 6]);
		ctx.strokeStyle = 'rgba(255,255,100,0.7)';
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(selectedMarble.x, selectedMarble.y);
		ctx.lineTo(selectedMarble.x + Math.cos(angle) * power * 1.5, selectedMarble.y + Math.sin(angle) * power * 1.5);
		ctx.stroke();
		ctx.setLineDash([]);
		ctx.restore();

		// 파워 게이지
		const ratio = power / 150;
		ctx.fillStyle = `rgba(${Math.round(255 * ratio)},${Math.round(255 * (1 - ratio))},0,0.85)`;
		ctx.fillRect(20, H - 30, power * 1.5, 14);
		ctx.strokeStyle = '#fff';
		ctx.lineWidth = 1;
		ctx.strokeRect(20, H - 30, 225, 14);
	}

	// 구슬
	marbles.forEach(m => drawMarble(m));
}

function drawMarble(m) {
	const isSelected = m === selectedMarble && dragging;
	const color = m.owner === PLAYER.P1 ? '#3b82f6' : '#ef4444';
	const highlight = m.owner === PLAYER.P1 ? '#93c5fd' : '#fca5a5';

	// 그림자
	ctx.beginPath();
	ctx.arc(m.x + 3, m.y + 4, RADIUS, 0, Math.PI * 2);
	ctx.fillStyle = 'rgba(0,0,0,0.3)';
	ctx.fill();

	// 본체
	const grad = ctx.createRadialGradient(m.x - 6, m.y - 6, 2, m.x, m.y, RADIUS);
	grad.addColorStop(0, highlight);
	grad.addColorStop(1, color);
	ctx.beginPath();
	ctx.arc(m.x, m.y, RADIUS, 0, Math.PI * 2);
	ctx.fillStyle = grad;
	ctx.fill();

	// 선택 표시
	if (isSelected) {
		ctx.beginPath();
		ctx.arc(m.x, m.y, RADIUS + 5, 0, Math.PI * 2);
		ctx.strokeStyle = 'rgba(255,255,100,0.9)';
		ctx.lineWidth = 2.5;
		ctx.stroke();
	}
}

// ── 물리 ──────────────────────────────────────────
function step() {
	let moving = false;

	marbles.forEach(m => {
		m.x += m.vx;
		m.y += m.vy;
		m.vx *= FRICTION;
		m.vy *= FRICTION;
		if (Math.abs(m.vx) < MIN_VEL) m.vx = 0;
		if (Math.abs(m.vy) < MIN_VEL) m.vy = 0;
		if (m.vx !== 0 || m.vy !== 0) moving = true;
	});

	// 구슬 간 충돌
	for (let i = 0; i < marbles.length; i++) {
		for (let j = i + 1; j < marbles.length; j++) {
			resolveCollision(marbles[i], marbles[j]);
		}
	}

	// 보드 밖 제거
	marbles = marbles.filter(m => m.x > BORDER && m.x < W - BORDER && m.y > BORDER && m.y < H - BORDER);

	return moving;
}

function resolveCollision(a, b) {
	const dx = b.x - a.x;
	const dy = b.y - a.y;
	const dist = Math.hypot(dx, dy);
	if (dist === 0 || dist >= RADIUS * 2) return;

	const nx = dx / dist;
	const ny = dy / dist;

	// 겹침 보정
	const overlap = RADIUS * 2 - dist;
	a.x -= nx * overlap / 2;
	a.y -= ny * overlap / 2;
	b.x += nx * overlap / 2;
	b.y += ny * overlap / 2;

	// 속도 교환 (탄성 충돌, 등질량)
	const dvx = a.vx - b.vx;
	const dvy = a.vy - b.vy;
	const dot = dvx * nx + dvy * ny;
	if (dot <= 0) return;

	a.vx -= dot * nx;
	a.vy -= dot * ny;
	b.vx += dot * nx;
	b.vy += dot * ny;
}

// ── 애니메이션 루프 ──────────────────────────────
function animate() {
	const stillMoving = step();
	render();

	if (stillMoving) {
		requestAnimationFrame(animate);
	} else {
		animating = false;
		checkGameOver();
		if (!gameOver) {
			nextTurn();
		}
	}
}

function checkGameOver() {
	const p1 = marbles.filter(m => m.owner === PLAYER.P1).length;
	const p2 = marbles.filter(m => m.owner === PLAYER.P2).length;

	if (p1 === 0 || p2 === 0) {
		gameOver = true;
		const winner = p2 === 0 ? '🔵 플레이어1 승리!' : '🔴 AI 승리!';
		document.getElementById('turnMsg').textContent = winner;
	}
}

function nextTurn() {
	turn = turn === PLAYER.P1 ? PLAYER.P2 : PLAYER.P1;
	updateUI();
	if (turn === PLAYER.P2) {
		setTimeout(aiTurn, AI_DELAY);
	}
}

// ── AI ──────────────────────────────────────────────
function aiTurn() {
	if (gameOver || animating) return;

	const myMarbles = marbles.filter(m => m.owner === PLAYER.P2);
	const targets = marbles.filter(m => m.owner === PLAYER.P1);
	if (myMarbles.length === 0 || targets.length === 0) return;

	// 가장 가까운 적 구슬 쌍 선택
	let bestShooter = null, bestTarget = null, bestDist = Infinity;
	myMarbles.forEach(s => {
		targets.forEach(t => {
			const d = Math.hypot(t.x - s.x, t.y - s.y);
			if (d < bestDist) { bestDist = d; bestShooter = s; bestTarget = t; }
		});
	});

	const dx = bestTarget.x - bestShooter.x;
	const dy = bestTarget.y - bestShooter.y;
	const dist = Math.hypot(dx, dy);
	// 파워: 거리 비례 + 약간의 랜덤
	const power = Math.min(dist * 0.12 + 3 + Math.random() * 2, 14);
	bestShooter.vx = (dx / dist) * power;
	bestShooter.vy = (dy / dist) * power;

	animating = true;
	requestAnimationFrame(animate);
}

// ── 입력 (Pointer Events + setPointerCapture) ────────
// setPointerCapture: 포인터를 캔버스에 잡아두어 브라우저 창 밖으로 나가도 이벤트 유지
// 마우스/터치/펜 모두 단일 코드로 처리
function getCanvasPos(e) {
	const rect = canvas.getBoundingClientRect();
	const scaleX = W / rect.width;
	const scaleY = H / rect.height;
	return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
}

function findMarble(pos, owner) {
	return marbles.find(m => m.owner === owner && Math.hypot(m.x - pos.x, m.y - pos.y) <= RADIUS + 4) || null;
}

canvas.style.touchAction = 'none'; // 터치 스크롤 방지

canvas.addEventListener('pointerdown', e => {
	if (turn !== PLAYER.P1 || animating || gameOver) return;
	const pos = getCanvasPos(e);
	const m = findMarble(pos, PLAYER.P1);
	if (!m) return;
	canvas.setPointerCapture(e.pointerId); // 창 밖으로 나가도 캔버스가 이벤트 수신
	selectedMarble = m;
	dragStart = pos;
	dragCurrent = pos;
	dragging = true;
});

canvas.addEventListener('pointermove', e => {
	if (!dragging) return;
	dragCurrent = getCanvasPos(e);
	render();
});

canvas.addEventListener('pointerup', e => {
	if (!dragging || !selectedMarble) return;
	dragCurrent = getCanvasPos(e);
	shoot();
});

canvas.addEventListener('pointercancel', () => {
	reset();
});

function shoot() {
	if (!dragStart || !dragCurrent || !selectedMarble) { reset(); return; }

	const dx = dragStart.x - dragCurrent.x;
	const dy = dragStart.y - dragCurrent.y;
	const power = Math.min(Math.hypot(dx, dy), 150);
	if (power < 5) { reset(); return; }

	const angle = Math.atan2(dy, dx);
	const speed = power * 0.1;
	selectedMarble.vx = Math.cos(angle) * speed;
	selectedMarble.vy = Math.sin(angle) * speed;

	reset();
	animating = true;
	requestAnimationFrame(animate);
}

function reset() {
	dragging = false;
	dragStart = null;
	dragCurrent = null;
	selectedMarble = null;
}

document.getElementById('restartBtn').addEventListener('click', initGame);

initGame();
