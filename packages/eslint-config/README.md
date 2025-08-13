# `@numio/eslint-config`

Collection of shared ESLint configurations for the Numio monorepo.

## Usage

### Base Configuration

For packages and apps that don't need React/Next.js specific rules:

```js
import { config } from '@numio/eslint-config/base';

export default [...config];
```

### React Configuration

For React/Next.js applications:

```js
import { config } from '@numio/eslint-config/react';

export default [...config];
```
