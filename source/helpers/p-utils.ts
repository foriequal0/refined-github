import {Promisable} from 'type-fest';

export function pSomeFunction(
	iterable: Iterable<() => Promisable<unknown>>,
): Promisable<boolean> {
	const promises: Array<Promisable<unknown>> = [];
	// Prioritize sync functions and early returns
	for (const item of iterable) {
		const result = item();
		if (typeof result === 'boolean') {
			if (result) {
				// Early sync return on the first truthy value
				return true;
			}
		} else {
			promises.push(result);
		}
	}

	if (promises.length === 0) {
		// Matches `[].some(Boolean)`
		return false;
	}

	return pSome(promises);
}

async function pSome(iterable: Iterable<Promisable<unknown>>): Promise<boolean> {
	// eslint-disable-next-line no-async-promise-executor -- It's fine, resolve is at the end
	return new Promise(async resolve => {
		for (const promise of iterable) {
			(async () => {
				if (await promise) {
					resolve(true);
				}
			})();
		}

		await Promise.allSettled(iterable);

		resolve(false);
	});
}

export function pEveryFunction(
	iterable: Iterable<() => Promisable<unknown>>,
): Promisable<boolean> {
	const promises: Array<Promisable<unknown>> = [];
	// Prioritize sync functions and early returns
	for (const item of iterable) {
		const result = item();
		if (typeof result === 'boolean') {
			if (!result) {
				// Early sync return on the first falsy value
				return false;
			}
		} else {
			promises.push(result);
		}
	}

	if (promises.length === 0) {
		// Matches `[].every(Boolean)`
		return true;
	}

	return pEvery(promises);
}

async function pEvery(iterable: Iterable<Promisable<unknown>>): Promise<boolean> {
	const results = await Promise.all(iterable);
	return results.every(Boolean);
}

export function pNoneFunction(
	iterable: Iterable<() => Promisable<unknown>>,
): Promisable<boolean> {
	const promises: Array<Promisable<unknown>> = [];
	// Prioritize sync functions and early returns
	for (const item of iterable) {
		const result = item();
		if (typeof result === 'boolean') {
			if (result) {
				// Early sync return on the first truthy value
				return false;
			}
		} else {
			promises.push(result);
		}
	}

	if (promises.length === 0) {
		// Matches `[].every(Boolean)`
		return true;
	}

	return pNone(promises);
}

async function pNone(iterable: Iterable<Promisable<unknown>>): Promise<boolean> {
	const results = await Promise.all(iterable);
	return results.every(Boolean);
}
