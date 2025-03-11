export class Concurrency1PromiseQueue {
	private queue: Array<() => Promise<any>> = [];

	public async add<T>(run: () => Promise<T>): Promise<T> {
		this.checkAndRun();

		const promise = new Promise<T>(resolve => {
			this.queue.push(() => run().then(resolve));
		});

		return promise;
	}

	public addSync<T>(
		run: () => Promise<T>,
		options: {
			onCatch: (error: any) => void;
			onThen?: (result: T) => void;
		},
	) {
		this.queue.push(() => run().then(options?.onThen).catch(options?.onCatch));
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
