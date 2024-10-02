import {Promisable} from 'type-fest';

import { pEveryFunction, pNoneFunction, pSomeFunction } from './p-utils.js';

export type BooleanFunction = () => boolean;
type PromisableBooleanFunction = () => Promisable<boolean>;

export type RunConditions = {
	/** Every condition must be true */
	asLongAs?: PromisableBooleanFunction[];
	/** At least one condition must be true */
	include?: PromisableBooleanFunction[];
	/** No conditions must be true */
	exclude?: PromisableBooleanFunction[];
};

export function isFeaturePrivate(id: string): boolean {
	return id.startsWith('rgh-');
}

// Safari iOS 17.6 has the key, but it does nothing
export const doesBrowserActionOpenOptions = !globalThis.chrome?.contextMenus || navigator.platform === 'iPhone' || navigator.platform === 'iPad';

export function shouldFeatureRun({
	/** Every condition must be true */
	asLongAs = [() => true],
	/** At least one condition must be true */
	include = [() => true],
	/** No conditions must be true */
	exclude = [() => false],
}: RunConditions): Promisable<boolean> {
	// make sure the function don't return `Promise` when there's no Promise in any conditions
	return promisableThen(pEveryFunction(asLongAs), c => {
		if (!c) {
			return false;
		}

		return promisableThen(pSomeFunction(include), c => {
			if (!c) {
				return false;
			}

			return pNoneFunction(exclude);
		});
	});
}

function promisableThen(p: Promisable<boolean>, then: (c: boolean) => Promisable<boolean>): Promisable<boolean> {
	if (typeof p === 'boolean') {
		return then(p);
	}

	return p.then(then);
}
