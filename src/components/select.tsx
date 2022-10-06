import {Listbox, Transition} from '@headlessui/react';
import {Fragment} from 'react';
import {HiCheck, HiChevronDown} from 'react-icons/hi';

type Value<T> = {
	value: T;
	name: string;
};

export function Select<T>(props: {
	items: Array<Value<T>>;
	selected: Value<T>;
	setSelected: (value: Value<T>) => unknown;
}) {
	const {selected, setSelected} = props;

	return (
		<div className="w-24">
			<Listbox value={selected} onChange={setSelected}>
				<div className="relative mt-1">
					<Listbox.Button className="relative w-full cursor-default rounded-lg bg-black py-2 pr-10 pl-3 text-left shadow-md hover:bg-neutral-800 focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
						<span className="block truncate">{selected.name}</span>
						<span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
							<HiChevronDown
								className="h-4 w-4 text-neutral-400"
								aria-hidden="true"
							/>
						</span>
					</Listbox.Button>

					<Transition
						as={Fragment}
						leave="transition ease-in duration-100"
						leaveFrom="opacity-100"
						leaveTo="opacity-0"
					>
						<Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
							{props.items.map(item => (
								<Listbox.Option
									key={item.name}
									className={({active}) => {
										const text = active
											? 'text-amber-900 bg-amber-100'
											: 'text-neutral-900';

										return `${text} cursor-default select-none relative py-2 pl-10 pr-4`;
									}}
									value={item}
								>
									{({selected, active}) => (
										<>
											<span
												className={`${
													selected ? 'font-medium' : 'font-normal'
												} block truncate`}
											>
												{item.name}
											</span>
											{selected && (
												<span
													className={`${
														active ? 'text-amber-600' : 'text-amber-600'
													}
                                absolute inset-y-0 left-0 flex items-center pl-3`}
												>
													<HiCheck className="h-5 w-5" aria-hidden="true" />
												</span>
											)}
										</>
									)}
								</Listbox.Option>
							))}
						</Listbox.Options>
					</Transition>
				</div>
			</Listbox>
		</div>
	);
}
