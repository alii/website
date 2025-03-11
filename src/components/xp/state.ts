import {atom} from 'alistair/atoms';
import {useCallback, useEffect, useId, useRef, useSyncExternalStore} from 'react';

class WindowZIndexStack {
	private readonly stack: string[];

	constructor(stack: string[] = []) {
		this.stack = stack;
	}

	promote(id: string): WindowZIndexStack {
		return new WindowZIndexStack([id, ...this.stack.filter(i => i !== id)]);
	}

	getPosition(id: string): number {
		return this.stack.indexOf(id);
	}

	isActive(id: string): boolean {
		return this.getPosition(id) === 0;
	}

	remove(id: string): WindowZIndexStack {
		return new WindowZIndexStack(this.stack.filter(i => i !== id));
	}

	get size(): number {
		return this.stack.length;
	}
}

export const atomActiveWindowStack = atom<WindowZIndexStack>(new WindowZIndexStack());

export function useActiveWindowStack() {
	const id = useId();

	const isAwaitingMouseUp = useRef(false);

	const listeners = {
		onMouseDown: () => {
			if (atomActiveWindowStack.get().isActive(id)) {
				return;
			}

			atomActiveWindowStack.set(stack => stack.promote(id));
			isAwaitingMouseUp.current = true;
		},

		onClickCapture: (e: React.MouseEvent<HTMLDivElement>) => {
			if (isAwaitingMouseUp.current) {
				e.stopPropagation();
				e.preventDefault();
				isAwaitingMouseUp.current = false;
			}
		},
	};

	useEffect(() => {
		atomActiveWindowStack.set(stack => stack.promote(id));

		return () => {
			atomActiveWindowStack.set(stack => stack.remove(id));
		};
	}, [id]);

	const subscribe = useCallback(
		(notify: (value: WindowZIndexStack) => void) => atomActiveWindowStack.subscribe(notify),
		[id],
	);

	const zIndex = useSyncExternalStore(
		subscribe,
		() => atomActiveWindowStack.get().size - atomActiveWindowStack.get().getPosition(id),
		() => atomActiveWindowStack.get().size - atomActiveWindowStack.get().getPosition(id),
	);

	const isActive = atomActiveWindowStack.get().isActive(id);

	return [zIndex, isActive, listeners] as const;
}
