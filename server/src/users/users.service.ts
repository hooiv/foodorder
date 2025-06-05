import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, Country } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findAllByCountry(country: Country): Promise<User[]> {
    if (country === Country.GLOBAL) {
      return this.usersRepository.find();
    }
    return this.usersRepository.find({ where: { country } });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  async create(userData: any): Promise<User> {
    const { email, password } = userData;
    
    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException(`User with email ${email} already exists`);
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
      // Create new user
    const newUser = this.usersRepository.create({
      ...userData,
      password: hashedPassword,
    });
      const result = await this.usersRepository.save(newUser);
    return result as unknown as User;
  }

  async updateUser(id: string, userData: any): Promise<User> {
    const user = await this.findOne(id);
    
    // If updating password, hash it
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    
    // Update user data
    Object.assign(user, userData);
    
    return this.usersRepository.save(user);
  }

  async updatePaymentMethod(userId: string, paymentMethod: string, currentUserRole: UserRole): Promise<User> {
    // Only ADMIN can update payment method
    if (currentUserRole !== UserRole.ADMIN) {
      throw new ForbiddenException('You do not have permission to update payment methods');
    }
    
    const user = await this.findOne(userId);
    user.paymentMethod = paymentMethod;
    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }

  async seedUsers(): Promise<void> {
    const users = [
      {
        name: 'Nick Fury',
        email: 'nick.fury@shield.com',
        password: await bcrypt.hash('admin123', 10),
        role: UserRole.ADMIN,
        country: Country.GLOBAL,
      },
      {
        name: 'Captain Marvel',
        email: 'captain.marvel@shield.com',
        password: await bcrypt.hash('manager123', 10),
        role: UserRole.MANAGER,
        country: Country.INDIA,
      },
      {
        name: 'Captain America',
        email: 'captain.america@shield.com',
        password: await bcrypt.hash('manager123', 10),
        role: UserRole.MANAGER,
        country: Country.AMERICA,
      },
      {
        name: 'Thanos',
        email: 'thanos@shield.com',
        password: await bcrypt.hash('member123', 10),
        role: UserRole.MEMBER,
        country: Country.INDIA,
      },
      {
        name: 'Thor',
        email: 'thor@shield.com',
        password: await bcrypt.hash('member123', 10),
        role: UserRole.MEMBER,
        country: Country.INDIA,
      },
      {
        name: 'Travis',
        email: 'travis@shield.com',
        password: await bcrypt.hash('member123', 10),
        role: UserRole.MEMBER,
        country: Country.AMERICA,
      },
    ];

    for (const userData of users) {
      const existingUser = await this.usersRepository.findOne({ 
        where: { email: userData.email } 
      });
      
      if (!existingUser) {
        const user = this.usersRepository.create(userData);
        await this.usersRepository.save(user);
      }
    }
  }
}
