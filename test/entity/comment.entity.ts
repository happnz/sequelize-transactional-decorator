import { Table, Column, Model } from 'sequelize-typescript';

@Table({ tableName: 'comment', timestamps: false })
export class Comment extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  id: number;

  @Column
  message: string;
}
