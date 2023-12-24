<script lang="ts">
	import type { FormProps } from '$lib';
	import { Form } from '$lib';

	const form: FormProps<{ nome: string }> = {
		onSubmit: (data) => alert(JSON.stringify(data))
	};
</script>

<Form {...form} let:bindEvents>
	<input use:bindEvents type="text" name="name" />
	<button>Enviar</button>
</Form>
