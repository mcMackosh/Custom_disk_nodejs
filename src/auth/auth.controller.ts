import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './guard/auth.guard';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) { }

	@Post('register')
	@HttpCode(HttpStatus.OK)
	public async register(@Body() dto: RegisterDto) {
		return this.authService.register(dto)
	}

	@Post('login')
	@HttpCode(HttpStatus.OK)
	public async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
		const { user, accessToken, refreshToken } = await this.authService.login(dto);
		res.cookie('refresh_token', refreshToken, {
			httpOnly: true,
			secure: true,
			sameSite: 'strict',
			maxAge: 7 * 24 * 3600 * 1000,
		});
		return { user, accessToken }
	}

	@Post('logout')
	@HttpCode(HttpStatus.OK)
	public async logout() {
		return this.authService.logout()
	}

	@Post('secret')
	@HttpCode(HttpStatus.OK)
	@UseGuards(AuthGuard)
	public async secret() {
		return { message: 'ok' }
	}

	@Post('refresh')
	@HttpCode(HttpStatus.OK)
	async refresh(@Req() req, @Res({ passthrough: true }) res: Response) {

		const refreshToken = req.cookies['refresh_token'];

		const { accessToken, refreshToken: newRefreshToken } = await this.authService.refreshTokens(refreshToken);


		res.cookie('refresh_token', newRefreshToken, {
			httpOnly: true,
			secure: true,
			sameSite: 'strict',
			maxAge: 7 * 24 * 3600 * 1000
		});

		return { accessToken };
	}
}
