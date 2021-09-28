import {Fragment} from 'react';
import {Listbox, Transition} from '@headlessui/react';
import {HiCheck, HiChevronDown} from 'react-icons/hi';

type Val<T> = {
	value: T;
	name: string;
};

export function Select<T>(props: {
	items: Array<Val<T>>;
	selected: Val<T>;
	setSelected: (val: Val<T>) => unknown;
}) {
	const {selected, setSelected} = props;

	return (
		<div className="w-24">
			<Listbox value={selected} onChange={setSelected}>
				<div className="relative mt-1">
					<Listbox.Button className="relative w-full py-2 pl-3 pr-10 text-left bg-black hover:bg-gray-800 rounded-lg shadow-md cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-orange-300 focus-visible:ring-offset-2 focus-visible:border-indigo-500 sm:text-sm">
						<span className="block truncate">{selected.name}</span>
						<span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
							<HiChevronDown
								className="w-4 h-4 text-gray-400"
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
						<Listbox.Options className="absolute w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
							{props.items.map((item, itemIndex) => (
								<Listbox.Option
									key={item.name}
									className={({active}) =>
										`${active ? 'text-amber-900 bg-amber-100' : 'text-gray-900'}
                          cursor-default select-none relative py-2 pl-10 pr-4`
									}
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
													<HiCheck className="w-5 h-5" aria-hidden="true" />
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
