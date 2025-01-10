export class Concurrency1PromiseQueue {
	private queue: Array<() => Promise<any>> = [];

	public async add<T>(run: () => Promise<T>): Promise<T> {
		this.checkAndRun();

		const promise = new Promise<T>(resolve => {
			this.queue.push(() => run().then(resolve));
		});

		return promise;
	}

	public addSync<T>(run: () => Promise<T>) {
		this.queue.push(() => run());
		this.checkAndRun();
	}

	private async checkAndRun() {
		if (this.queue.length === 0) return;

		const promise = this.queue.shift();
		if (!promise) return;

		await promise();
		this.checkAndRun();
	}
}

export const spotifyQueue = new Concurrency1PromiseQueue();
