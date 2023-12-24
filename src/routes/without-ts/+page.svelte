<script>
	import { Form } from '$lib';

	/**
	 * @type {import('$lib').FormProps<{nome: string}>}
	 */
	const form = {
		onSubmit: (data) => alert(JSON.stringify(data))
	};
</script>

<Form {...form} let:bindEvents>
	<input use:bindEvents type="text" name="name" />
	<button>Enviar</button>
</Form>
