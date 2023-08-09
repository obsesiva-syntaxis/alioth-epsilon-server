import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { LoginUserDTO, RegisterUserDTO } from './dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserLog } from './entities/userLog.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LoginResponse } from './interfaces/user.interface';



@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(UserLog.name) private readonly userLogModel: Model<UserLog>,
    private readonly jwtService: JwtService
  ){}

  async login({ email, password }: LoginUserDTO): Promise<LoginResponse> {
    const user = await this.userModel.findOne({ email });
    if( !user ) throw new UnauthorizedException('Email/Password Do not match.');
    if (!bcrypt.compareSync(password, user.password ) ) throw new BadRequestException('Email/Password Do not match.');
    const token = this.getJwtToken({ id: user.id });
    const userLogged = await this.userLogModel.findOne({ email: user.email })
    if( userLogged ) throw new BadRequestException('User logged with this email, contact support.');
    await this.userLogModel.create({
      userId: user.id,
      token: token,
      email: user.email,
      roles: user.roles
    });
    user.password = undefined;

    return {
      token,
      user
    };
  }

  async register( registerInput: RegisterUserDTO): Promise<User> {
      const user = await this.userModel.findOne({ email: registerInput.email });
      if( user ) throw new BadRequestException('email already exist in database.');
      const newUser = await this.userModel.create({
        ...registerInput,
        password: bcrypt.hashSync( registerInput.password, 10),
      });
      newUser.password = undefined;
      return newUser;
  }

  async logout( id: string ): Promise<boolean> {
    const user = await this.userModel.findById(id);
    const userLogged = await this.userLogModel.findOne({ email: user.email });
    if( !userLogged ) throw new BadRequestException(`that user doesn't logged in system.`);
    await this.userLogModel.findByIdAndRemove(userLogged);
    return true;
  }

  private getJwtToken( payload: JwtPayload ): string {
    const token = this.jwtService.sign( payload );
    return token;
  }

  async validateUser( id: string ): Promise<User>{
    const user = await this.userModel.findById( id );
    if ( !user.active ) throw new UnauthorizedException(`User is inactive, talk with an admin.`);
    delete user.password;
    return user;  
  }

  async checkAuthStatus( user: User ){
    return {
      ...user,
      token: this.getJwtToken({ id: user.id })
    };
  }

  private handleDatabaseErrors(code: any): never{
    if(code === '23505') throw new BadRequestException('email already exist in database.');
    throw new InternalServerErrorException('internal server error please contact with developers');
  }
}


