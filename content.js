let ghostElement; // the "highlighter" box UI component that appears when snipping
let startPos;
let startY;

chrome.runtime.onMessage.addListener((request) => {
    switch (request.type) {
		case "grab-coordinates":
			startScreenshot();
            break;
	}
});


function startScreenshot() {
	document.body.style.cursor = "crosshair";
    document.addEventListener("mousedown", mouseDown, false);
}

function endScreenshot(coords) {
	document.removeEventListener("mousedown", mouseDown, false);
	sendMessage({type: "snippet-screenshot", coords: coords});
}
 
function sendMessage(msg) {
	document.body.style.cursor = 'default';
	chrome.runtime.sendMessage(msg);
};

/** 
 * Begin the process of snippet screenshot by creating
 * "highlighter" UI component to indicate the selected area to be recorded.
 */
function mouseDown(e) {
    e.preventDefault();

	startPos = {x: e.pageX, y: e.pageY};
    startY = e.y;
	
	ghostElement = document.createElement('div');
	ghostElement.style.background = 'blue';
	ghostElement.style.opacity = '0.1';
	ghostElement.style.position = 'absolute';
	ghostElement.style.left = e.pageX + 'px';
	ghostElement.style.top = e.pageY + 'px';
	ghostElement.style.width = "0px";
	ghostElement.style.height = "0px";
	ghostElement.style.zIndex = "1000000";
	document.body.appendChild(ghostElement);
	
	document.addEventListener('mousemove', mouseMove, false);
	document.addEventListener('mouseup', mouseUp, false);
	
	return false;
}

/** 
 * Update coordinates of "highlighter" UI component.
 */
function mouseMove(e) {
    e.preventDefault();

    let nowPos = {x: e.pageX, y: e.pageY};
    
    // change top-left corner if selection goes above or left of start
    ghostElement.style.left = nowPos.x < startPos.x ? `${nowPos.x}px` : `${startPos.x}px`;
    ghostElement.style.top = nowPos.y < startPos.y ? `${nowPos.y}px` : `${startPos.y}px`;

	let diff = {x: nowPos.x - startPos.x, y: nowPos.y - startPos.y};
	
	ghostElement.style.width = Math.abs(diff.x) + 'px';
	ghostElement.style.height = Math.abs(diff.y) + 'px';
	
	return false;
}

/** 
 * Copute final coordinates of "highlighter" UI component.
 */
function mouseUp(e) {
    e.preventDefault();
    
	let nowPos = {x: e.pageX, y: e.pageY};
	let diff = {x: nowPos.x - startPos.x, y: nowPos.y - startPos.y};
 
	document.removeEventListener('mousemove', mouseMove, false);
	document.removeEventListener('mouseup', mouseUp, false);
	
	ghostElement.parentNode.removeChild(ghostElement);
	
	setTimeout(function() {
		let scale = window.devicePixelRatio ? window.devicePixelRatio : 1;
		var coords = {
			w: Math.abs(diff.x) * scale,
			h: Math.abs(diff.y) * scale,
			x: (Math.min(nowPos.x, startPos.x) - window.pageXOffset) * scale,
			y: (Math.min(nowPos.y, startPos.y) - window.pageYOffset) * scale
		};
		endScreenshot(coords);
	}, 50);
	
	return false;
}
