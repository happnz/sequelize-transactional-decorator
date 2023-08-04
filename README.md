# sequelize-transactional-decorator

A `Transactional` method decorator for Sequelize inspired by Java Spring's `Transactional` annotation.

## Installation

```shell
npm install --save sequelize-transactional-decorator
```

**Before establishing any connections** using Sequelize,
import and call _initSequelizeCLS_ :
```typescript
import { initSequelizeCLS } from 'sequelize-transactional-decorator';


initSequelizeCLS();
```
After establishing a connection,
import and call _initSequelizeTransactional_ :
```typescript
import { initSequelizeTransactional } from 'sequelize-transactional-decorator';


initSequelizeTransactional(sequelize); // pass your Sequelize connection here
```