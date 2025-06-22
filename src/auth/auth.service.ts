import { ConflictException, Inject, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserService } from 'src/user/user.service';
import { verify } from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class AuthService {

	constructor(
		private readonly userService: UserService,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
		private readonly redisService: RedisService,
	) { }


	public async login(dto: LoginDto) {
		const existingUser = await this.userService.findByEmail(dto.email)

		if (!existingUser || !existingUser.password) {
			throw new NotFoundException(
				'User with this email does not exist. Please, register first or try another email.'
			)
		}

		const isValidPassword = await verify(existingUser.password, dto.password)

		if (!isValidPassword) {
			throw new UnauthorizedException(
				'Password is incorrect. Please, try again or reset your password.'
			)
		}

		const accessToken = await this.generateToken('ACCESS', existingUser.id);
		const refreshToken = await this.generateToken('REFRESH', existingUser.id);

		await this.redisService.setRefreshToken(existingUser.id, refreshToken);

		return { user: existingUser, accessToken, refreshToken }
	}
	public async register(dto: RegisterDto) {
		const user = await this.userService.findByEmail(dto.email)

		if (user) {
			throw new ConflictException(
				'User with wthis email already exists. Please, try to login or use another email.'
			)
		}

		const newUser = await this.userService.create(
			dto.email,
			dto.password,
			dto.displayName,
			false
		)

		const accessToken = await this.generateToken('ACCESS', newUser.id)
		const refreshToken = await this.generateToken('REFRESH', newUser.id);

		await this.redisService.setRefreshToken(newUser.id, refreshToken);

		return { message: 'User created successfully' }
	}

	async generateToken(type: 'ACCESS' | 'REFRESH', userId: string, spaceId?: string): Promise<string> {
		const payload = { userId }
		console.log('Generating token', type, userId, spaceId);
		if (spaceId) {
			payload['spaceId'] = spaceId;
		}
		return this.jwtService.signAsync(payload, {
			secret: this.configService.get('JWT_SECRET'),
			expiresIn: type === 'ACCESS' ? '30m' : '3d',
		});
	}

	async refreshTokens(token: string) {

		let payload: any;
		try {
			payload = await this.jwtService.verifyAsync(token, {
				secret: process.env.JWT_REFRESH_SECRET,
			});
		} catch {
			throw new UnauthorizedException('Invalid refresh token');
		}

		const saved = await this.redisService.getRefreshToken(payload.userId);
		if (!saved || saved !== token) {
			throw new UnauthorizedException('Token mismatch');
		}

		const accessToken = await this.generateToken('ACCESS', payload.userId)
		const refreshToken = await this.generateToken('REFRESH', payload.userId);

		await this.redisService.setRefreshToken(payload.userId, refreshToken);
		const newUser = await this.userService.findById(payload.userId);

		return { user: newUser, accessToken, refreshToken }
	}

	public async logout(): Promise<void> {
		return new Promise(() => { })
	}

}
