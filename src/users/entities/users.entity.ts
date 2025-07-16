import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users' })
export class UsersEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ unique: true })
  login: string;
  @Column({ unique: true })
  email: string;
  @Column()
  password: string;
  @Column()
  role: string;
}