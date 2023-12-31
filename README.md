# Sequelize Transactional decorator

A `@Transactional` method decorator for **Sequelize** inspired by Java Spring's `@Transactional` annotation. 

Simple integration with **NestJS**.

## Installation

```shell
# npm
npm install --save sequelize-transactional-decorator
# yarn
yarn add sequelize-transactional-decorator
```


## Usage

### Step 1

**Before establishing any connections** using Sequelize,
you need to enable Sequelize to use node CLS:
```typescript
import { initSequelizeCLS } from 'sequelize-transactional-decorator';


initSequelizeCLS();
```

### Step 2

### With NestJS:

Import `SequelizeTransactionalModule.register()` into your root application module.

Example:
```typescript
@Module({
  imports: [
    SequelizeModule.forRoot({
      ...
    }),
    SequelizeTransactionalModule.register(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

If you specified custom connection name in `SequelizeModule`, pass `connectionName` into options:
```typescript
@Module({
  imports: [
    SequelizeModule.forRoot({
      ...
      name: 'my-connection-name',
    }),
    SequelizeTransactionalModule.register({ connectionName: 'my-connection-name' }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

### Without NestJS:

Just call `initSequelizeTransactional` after establishing a connection:

```typescript
const sequelize = new Sequelize({ ... })

initSequelizeTransactional(sequelize) // pass your Sequelize conection here
```

### Step 3

Use `@Transactional` annotation on your class methods.

Example:

```typescript
@Injectable()
export class AppService {
  constructor(
    @InjectModel(Something)
    private readonly something: typeof Something,
    private readonly anotherService: AnotherService,
  ) {}

  @Transactional()
  async appMethod(): Promise<void> {
    await this.something.create({ message: 'hello' });
    await this.something.create({ message: 'world' });
    await this.anotherService.method(); // other service's method will use the same transaction
  }
}

```

`@Transactional` decorator accepts `options` object:
```typescript
{
  isolationLevel?: string; // Isolation Level of transaction. Default value depends on your Sequelize config or the database you use
  propagation?: string; // Default value is REQUIRED. Allowed options are described below
}
```

## Propagation options

- `REQUIRED` (default) - If exists, use current transaction, otherwise create a new one.
- `SUPPORTS` - If exists, use current transaction, otherwise execute without transaction.
- `MANDATORY` - If exists, use current transaction, otherwise throw an exception.  
- `NEVER` - Execute without transaction. If an active transaction exists, throw an exception. 
- `NOT_SUPPORTED` - Execute without transaction, suspend an active transaction if it exists. 
- `REQUIRES_NEW` - Always execute in a separate transaction, suspend an active transaction if it exists.


## Isolation Level Options

- `READ UNCOMMITTED`
- `READ COMMITTED`
- `REPEATABLE READ`
- `SERIALIZABLE`

For more info refer to your database documentation.

## Mocking in unit tests

If you want to remove transactional logic from your unit tests, you can mock `@Transactional` decorator.

Example in Jest:

```typescript
jest.mock('sequelize-transactional-decorator', () => ({
  Transactional: () => () => ({}),
}));
```

However, you can test your code with `@Transactional` as usual, if you configure it in tests following the same steps described above.
