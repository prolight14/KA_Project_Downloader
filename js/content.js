var scratchpadId = window.location.pathname.split('/').reverse()[0];

scratchpadId = Number(scratchpadId);

if(!isNaN(scratchpadId))
{
	console.log(scratchpadId);

	chrome.runtime.sendMessage({ scratchpadId: scratchpadId });
}

