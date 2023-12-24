<script lang="ts">
	import { createForm, type FormState } from '$lib/Form';
	import type { Schema } from 'yup';

	export let defaultValues = {};
	type Data = typeof defaultValues;

	export let schema: Schema | boolean = false;
	export let reset: boolean = true;
	export let scroll: boolean = true;
	export let onSubmit:
		| ((data?: Partial<Data>) => void)
		| ((data?: Partial<Data>) => Promise<void>) = () => {};
	export let onUpdate: (state?: FormState<Data>) => void = () => {};

	const { submitHandler, store, setValue, bindEvents, add, remove } = createForm<Data>({
		defaultValues,
		schema,
		reset,
		scroll,
		onSubmit,
		onUpdate
	});
</script>

<form action="/" on:submit={submitHandler}>
	<slot state={$store} {setValue} {bindEvents} {add} {remove} />
</form>
