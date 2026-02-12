// src/database/realm/schemas.ts
import Realm from 'realm';

export class TaskSchema extends Realm.Object<TaskSchema> {
  id!: string;
  title!: string;
  description!: string;
  completed!: boolean;
  userId!: string;
  createdAt!: Date;
  updatedAt!: Date;
  reminderTime?: Date;
  synced!: boolean;

  static schema: Realm.ObjectSchema = {
    name: 'Task',
    primaryKey: 'id',
    properties: {
      id: 'string',
      title: 'string',
      description: 'string',
      completed: { type: 'bool', default: false },
      userId: 'string',
      createdAt: 'date',
      updatedAt: 'date',
      reminderTime: 'date?',
      synced: { type: 'bool', default: false },
    },
  };
}

export const schemas = [TaskSchema];
