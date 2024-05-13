import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';

import * as bcryptjs from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayLoad } from 'src/interfaces/jwt-payload';
import { LoginResponse } from 'src/interfaces/login-response';
import { RegisterUserDto } from './dto';

@Injectable()
export class AuthService {


  constructor(
    @InjectModel( User.name )
     private userModel: Model<User>,
     private jwtService: JwtService,)
  {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    

    
    try {

      const {password, ...userData} = createUserDto;
      
      const newUser = new this.userModel({
        password: bcryptjs.hashSync(password, 10),
        ...userData
      });

      await newUser.save();
      const {password:_,  ...user} = newUser.toJSON();


      return user;
      
    } catch (error) {

      if( error.code === 11000 ){
        throw new BadRequestException(`${ createUserDto.email } already exists!` )
      }
      throw new InternalServerErrorException('Something terrible happen!!' );
    }
    
 
  }

  async register(createUserDto: RegisterUserDto) : Promise<LoginResponse>{

    

    try{
      const user:User = await  this.create(createUserDto);
      console.log(user);
      // const {email} = user;
      // const userOne = await this.userModel.findOne({email});



      return {
        user: user,
        token: this.getJwtToken({id: user._id})
      }
    }catch (error) {
      throw new InternalServerErrorException('Something terrible happen!!' );

    }
 
  }

  async login (loginDto: LoginDto):Promise<LoginResponse> {
  
    const {email, password} = loginDto;

    const user = await this.userModel.findOne({ email });

    if( !user ){
      throw new UnauthorizedException('Not valid credentials - email or password');
    }
    /**
     * User(_id, name, email, roles, )
     * token-> asdadada.safgsafsafas.fsafasdsadsa
     */

    if ( !bcryptjs.compareSync(password, user.password)){
      throw new UnauthorizedException('Not valid credentials - email or password');
    }
    const {password:_, ...rest} = user.toJSON();

    return {
      user: rest,
      token: this.getJwtToken( {id: user.id})
    }
  }

  findAll(): Promise<User[]>{
    return  this.userModel.find();
  }

  findUserById( userId: string){
    const user = this.userModel.findById( userId);
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  getJwtToken( payload: JwtPayLoad){
    const token = this.jwtService.sign(payload);
    return token;
  }
}
