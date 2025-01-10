import {atom, useAtom} from 'alistair/atoms';
import {useEffect, useId, useRef} from 'react';

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

	const [stack, setStack] = useAtom(atomActiveWindowStack);

	const isAwaitingMouseUp = useRef(false);

	const listeners = {
		onMouseDown: () => {
			if (stack.isActive(id)) {
				return;
			}

			setStack(stack => stack.promote(id));
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
		setStack(stack => stack.promote(id));

		return () => {
			setStack(stack => stack.remove(id));
		};
	}, [id]);

	const zIndex = stack.size - stack.getPosition(id);

	const isActive = stack.isActive(id);

	return [zIndex, isActive, listeners] as const;
}
