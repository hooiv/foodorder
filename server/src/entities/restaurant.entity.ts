import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { MenuItem } from './menu-item.entity.js';

export enum Country {
  GLOBAL = 'global',
  INDIA = 'india',
  AMERICA = 'america',
}

@Entity('restaurants')
export class Restaurant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column('text')
  description: string;

  @Column({ nullable: true })
  imageUrl: string;
  
  @Column({ nullable: true })
  address: string;
  
  @Column({
    type: 'enum',
    enum: Country,
    default: Country.GLOBAL,
  })
  country: Country;

  @OneToMany(() => MenuItem, menuItem => menuItem.restaurant)
  menuItems: MenuItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
