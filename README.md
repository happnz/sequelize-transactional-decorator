# sequelize-transactional-decorator

A `Transactional` method decorator for Sequelize inspired by Java Spring's `Transactional` annotation. 

Easy usage with NestJS

## Installation

```shell
npm install --save sequelize-transactional-decorator
```


## Usage

### _Step 1_

**Before establishing any connections** using Sequelize,
import and call _initSequelizeCLS_ :
```typescript
import { initSequelizeCLS } from 'sequelize-transactional-decorator';


initSequelizeCLS();
```

&nbsp;

### _Step 2_

### _If you use sequelize in your NestJS app:_

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

If you have multiple Sequelize connections, import `SequelizeTransactionalModule.register` for each connection


### _If you dont use NestJS_ 

Just call _initSequelizeTransactional_ after establishing a connection:

```typescript
const sequelize = new Sequelize({ ... })

initSequelizeTransactional(sequelize) // pass your Sequelize conection here
```

&nbsp;

### Step 3

Use `Transactional` annotation on your class methods.

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
    await this.anotherService.method(); // other service's method will use the same transaction unless also marked with @Transactional (in that case, that method will use its own transaction)
  }
}

```