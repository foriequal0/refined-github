import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import GitHubFileURL from '../github-helpers/github-file-url.js';
import {scrollIntoViewIfNeeded} from '../github-helpers/index.js';

function scrollToCurrentFile(): void {
	const url = new GitHubFileURL(location.href);
	const filePath = url.filePath;

	// we need to escape the filePath if we use querySelector.
	// eslint-disable-next-line unicorn/prefer-query-selector
	const item = document.getElementById(`${filePath}-item`);
	if (item) {
		scrollIntoViewIfNeeded(item);
	}
}

function init(signal: AbortSignal): void {
	signal.addEventListener('abort', unload);

	window.addEventListener('turbo:load', scrollToCurrentFile, {once: true});
}

function unload(): void {
	window.removeEventListener('turbo:load', scrollToCurrentFile);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoTree,
		pageDetect.isSingleFile,
	],
	exclude: [
		pageDetect.isRepoRoot,
	],
	awaitDomReady: true,
	init,
});

/*

Test URLs:

https://github.com/refined-github/refined-github/tree/main/source/features (on directory)
https://github.com/refined-github/refined-github/blob/main/source/refined-github.ts (on file)

*/
