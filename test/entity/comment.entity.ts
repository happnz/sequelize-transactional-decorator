import { Table, Column, Model } from 'sequelize-typescript';

@Table({ tableName: 'comment', timestamps: true })
export class Comment extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  id: number;

  @Column
  message: string;
}
