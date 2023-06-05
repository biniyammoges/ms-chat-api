import { NotFoundException } from '@nestjs/common';
import { VIRTUAL_COLUMN_KEY } from './decorators/virtual-column.decorator';
import { SelectQueryBuilder } from 'typeorm';

declare module 'typeorm' {
     interface SelectQueryBuilder<Entity> {
          getMany(this: SelectQueryBuilder<Entity>): Promise<Entity[]>;
          getOne(this: SelectQueryBuilder<Entity>): Promise<Entity | undefined>;
          getOneOrFail(this: SelectQueryBuilder<Entity>): Promise<Entity>;
     }
}

const addVirtualColumn = async (qb: SelectQueryBuilder<any>) => {
     const { entities, raw } = await qb.getRawAndEntities();

     const items = entities.map(entitiy => {
          const metaInfo = Reflect.getMetadata(VIRTUAL_COLUMN_KEY, entitiy) ?? {};

          const index = raw.findIndex(({ [`${qb.alias}_Id`]: Id }) => Id === entitiy.Id);

          const item = raw[index];

          for (const [propertyKey, name] of Object.entries<string>(metaInfo)) {
               entitiy[propertyKey] = item[name];
          }

          return entitiy;
     });

     return items;
};

SelectQueryBuilder.prototype.getMany = async function () {
     const items = await addVirtualColumn(this);

     return [...items];
};

SelectQueryBuilder.prototype.getOne = async function () {
     const items = await addVirtualColumn(this);
     return items[0];
};

SelectQueryBuilder.prototype.getOneOrFail = async function () {
     const items = await addVirtualColumn(this);

     if (!items.length) {
          throw new NotFoundException('Entity not found.');
     }

     return items[0];
};