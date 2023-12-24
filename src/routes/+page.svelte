<script lang="ts">
	import { createForm } from '$lib';

	const { submitHandler, bindEvents } = createForm<{ name: string }>({
		onSubmit: (data) => alert(JSON.stringify(data))
	});
</script>

<form action="/" on:submit={submitHandler}>
	<input use:bindEvents type="text" name="name" />
	<button>Enviar</button>
</form>
