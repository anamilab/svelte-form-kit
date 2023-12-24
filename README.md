Svelte Form Kit
===============

Descrição
---------

**Svelte Form Kit** é uma biblioteca de formulários para Svelte, projetada para simplificar a gestão de estado dos formulários em aplicações Svelte. Com suporte a TypeScript, esta biblioteca oferece uma solução eficiente e flexível para o manuseio de formulários. Inclui um componente `Form` para facilitar a herança do estado em diversos formulários.

Status
------

Atualmente em desenvolvimento ativo, a versão mais recente é a **0.0.3**. O projeto está aberto a contribuições da comunidade.

Características
---------------

-   Suporte completo a TypeScript
-   Gerenciamento simplificado do estado do formulário
-   Componente `Form` para herança de estado
-   Fácil integração com projetos Svelte

Instalação
----------

bash

`npm install svelte-form-kit`

Uso Básico
----------

Exemplo de como usar a biblioteca em um projeto Svelte:

```svelte

<script>
  import { Form, ... } from 'svelte-form-kit';

  let formData = { ... };
</script>

<Form bind:data={formData}>
  ...
</Form>
```

Contribuindo
------------

Contribuições são bem-vindas! Se você deseja contribuir, por favor, consulte as `issues` abertas ou abra uma nova para discussão sobre o que você gostaria de mudar.

Licença
-------

MIT