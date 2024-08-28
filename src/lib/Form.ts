/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @todo remover os tipos any da classe
 */
import { setContext } from 'svelte';
import { derived, writable, type Writable } from 'svelte/store';
import { scrollToElement, isEqual } from './utils.js';
import type { Schema } from 'yup';
import key from './key.js';

export type FormState<T> = {
	data: Partial<T>;
	loading: boolean;
	errors: { [key: string]: string };
	didAnyError: boolean;
};

export interface FormAttributes<T> {
	defaultValues: Partial<T>;
	scroll: boolean;
	schema: Schema | boolean;
	reset: boolean;
	startData: boolean;
	onCreate: (data?: Form<T>) => void;
	onSubmit: ((data?: Partial<T>) => void) | ((data?: Partial<T>) => Promise<void>);
	onUpdate: (state?: FormState<T>) => void;
}

export type FormProps<T> = Partial<FormAttributes<T>>;

type Field = HTMLInputElement | HTMLSelectElement;

type YupError = {
	path: string;
	message: string;
};

type YupErrors = {
	inner: YupError[];
};

class Form<T> implements FormAttributes<T> {
	defaultValues: Partial<T> = {};
	scroll: boolean;
	schema: Schema | boolean;
	reset: boolean;
	startData: boolean;
	onCreate: (form?: Form<T>) => void;
	onSubmit: ((data?: Partial<T>) => void) | ((data?: Partial<T>) => Promise<void>);
	onUpdate: (state?: FormState<T>) => void;
	currentState: FormState<T>;
	store: Writable<FormState<T>>;
	prevData: Partial<T> = {};

	constructor({
		defaultValues = {},
		scroll = false,
		schema = false,
		reset = false,
		startData = false,
		onCreate = () => {},
		onSubmit = () => {},
		onUpdate = () => {}
	}: Partial<FormAttributes<T>> | undefined = {}) {
		this.defaultValues = defaultValues;
		this.scroll = scroll;
		this.schema = schema;
		this.reset = reset;
		this.startData = startData;
		this.onCreate = onCreate;
		this.onSubmit = onSubmit;
		this.onUpdate = onUpdate;

		this.currentState = {
			data: defaultValues || {},
			loading: false,
			errors: {},
			didAnyError: false
		};
		this.store = writable(this.currentState);

		this.store.subscribe((state) => {
			this.currentState = state;
			this.onUpdate(state);
			
			if (state.didAnyError && !isEqual(state.data, this.prevData)) {
				this.isValid();
				this.prevData = state.data;
			}
		});

		this.onCreate(this);
		this.createContext();
	}

	createContext() {
		setContext(key, this);
	}

	bindEvents = (node: Field) => {
		const isCheckbox = (element: Field) =>
			element instanceof HTMLInputElement && element.type === 'checkbox';

		const getCheckboxValue = (element: HTMLInputElement) => {
			return (element.checked && (element.value === 'on' || element.value)) || false;
		};

		const listener = (e: Event) => {
			const element = e.target as Field;
			const name = element.getAttribute('name');

			if (!name) return;

			const parts = name.replace(/\]/g, '').split('[');
			const isArray = parts.length > 1;
			const [field, ...structure] = parts;

			const value = isCheckbox(element)
				? getCheckboxValue(element as HTMLInputElement)
				: element.value;

			const getData = (state: FormState<T>) =>
				isArray
					? this.#modifyField(state.data[field as keyof T], structure, value, 'update')
					: value;

			this.store.update((state) => {
				return {
					...state,
					data: {
						...state.data,
						[field]: getData(state)
					}
				};
			});
		};

		if (node.type !== 'checkbox') node.addEventListener('input', listener);
		node.addEventListener('change', listener);
		if (this.startData) node.dispatchEvent(new Event('change'));
	};

	#setErrors = (errors: unknown, toScroll = true) => {
		const convertPathToBracketNotation = (path: string) => {
			const segments = path.split(/\.|\[(.*?)\]/).filter(Boolean);

			if (segments.length === 1) return path;

			return segments
				.map((segment, i) => {
					if (i === 0) return segment;

					return segment.includes('[') ? segment : `[${segment}]`;
				})
				.join('');
		};

		if (typeof errors === 'object' && errors !== null && 'inner' in errors) {
			const { inner } = errors as YupErrors;

			this.store.update((state) => {
				const firstError = Object.values(inner)[0];
				const bracketName = convertPathToBracketNotation(firstError.path);
				const element = document.querySelector<HTMLElement>(`[name="${bracketName}"]`);

				if (element && toScroll) scrollToElement(element);

				return {
					...state,
					errors: inner.reduce(
						(collection, error) => {
							collection[convertPathToBracketNotation(error.path)] = error.message;
							return collection;
						},
						{} as { [key: string]: string }
					)
				};
			});
		} else {
			console.log(errors);
		}
	};

	isValid = async () => {
		const state = this.currentState;

		if (typeof this.schema === 'boolean') return true;

		try {
			await this.schema.validate(state.data, { abortEarly: false });

			this.store.update((state) => ({ ...state, errors: {} }));

			return true;
		} catch (errors) {
			if (!state.didAnyError)
				this.store.update((state) => ({ ...state, didAnyError: true }));

			this.#setErrors(errors, this.scroll);
			return false;
		}
	};

	#setLoading = (loading: boolean) => {
		this.store.update((state) => ({
			...state,
			loading
		}));
	};

	submitHandler = async (e: Event) => {
		e?.preventDefault();

		if (!(await this.isValid())) return;

		const state = this.currentState;

		this.#setLoading(true);
		await this.onSubmit(state.data);
		this.#setLoading(false);
		if (this.reset) this.resetState();
	};

	resetState = () => {
		this.store.update((state) => ({
			...state,
			data: {
				...this.defaultValues
			},
			errors: {},
			didAnyError: false
		}));
	};

	watch = (attributeName: string) => {
		let currentValue = this.currentState.data[attributeName as keyof T];

		return derived(this.store, ($form) => {
			const data: unknown = $form.data[attributeName as keyof T];
			if (data !== currentValue) {
				currentValue = $form.data[attributeName as keyof T];
				return currentValue;
			}
		});
	};

	getValue = (name: string, state = this.currentState) => {
		if (!name) return undefined;
		const parts = name.replace(/\]/g, '').split('[');
		const isArray = parts.length > 1;

		if (isArray) {
			const [name, ...structure] = parts;

			return this.#getValueRecursively(structure, state.data[name as keyof T]);
		}

		return state.data[name as keyof T];
	};

	setValue = (field: string, valueOrCallback: any) => {
		this.store.update((state) => {
			const parts = field.replace(/\]/g, '').split('[');
			const isArray = parts.length > 1;
			const [name, ...structure] = parts;

			const value =
				typeof valueOrCallback === 'function'
					? valueOrCallback(state.data[name as keyof T])
					: valueOrCallback;

			return {
				...state,
				data: {
					...state.data,
					[name]: isArray
						? this.#modifyField(state.data[name as keyof T], structure, value, 'update')
						: value
				}
			};
		});
	};

	add = (field: string, value: any) => {
		const parts = field.replace(/\]/g, '').split('[');
		const [name, ...structure] = parts;

		this.store.update((state: any) => ({
			...state,
			data: {
				...state.data,
				[name]: this.#modifyField(state.data[name], structure, value, 'add')
			}
		}));
	};

	remove = (field: string, i: number) => {
		const parts = field.replace(/\]/g, '').split('[');
		const [name, ...structure] = parts;
		
		this.store.update((state: any) => ({
			...state,
			data: {
				...state.data,
				[name]: this.#modifyField(state.data[name], structure, (_: any, j: number) => j !== i, 'remove')
			}
		}));
	};

	#getValueRecursively = (path: string[], state: any): any => {
		const name = path[0];

		if (typeof name !== 'string') return state;
		if (!state) return state;

		return this.#getValueRecursively(path.slice(1), state[name]);
	};

	#modifyField(
		currentFieldValue: any,
		path: string[],
		value: any,
		action: 'add' | 'update' | 'remove'
	): any {
		if (path.length === 0) {
			switch (action) {
				case 'add':
					return currentFieldValue ? [...currentFieldValue, value] : [value];
				case 'update':
					return value;
				case 'remove':
					return currentFieldValue
						? currentFieldValue.filter((v: any, i: number) => value(v, i))
						: [];
				default:
					throw new Error(`Ação desconhecida: ${action}`);
			}
		}

		if (currentFieldValue === undefined)
			currentFieldValue = path[0] === '' || !Number.isNaN(parseInt(path[0])) ? [] : {};

		const key = path[0];
		const nextFieldValue = Array.isArray(currentFieldValue)
			? [...currentFieldValue]
			: { ...currentFieldValue };

		if (path.length === 1 && path[0] === '') {
			switch (action) {
				case 'add':
					return [...currentFieldValue, value];
				case 'update':
					if (currentFieldValue.indexOf(value) === -1) {
						return [...currentFieldValue, value];
					} else {
						return currentFieldValue.filter((item: any) => item !== value);
					}
				case 'remove':
					return currentFieldValue.filter((v: any, i: number) => value(v, i));
				default:
					throw new Error(`Ação desconhecida: ${action}`);
			}
		}

		nextFieldValue[key] = this.#modifyField(nextFieldValue[key], path.slice(1), value, action);
		return nextFieldValue;
	}
}

export const createForm = <T>(state?: Partial<FormAttributes<T>>) => {
	return new Form(state);
};
