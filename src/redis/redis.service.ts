import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  async setRefreshToken(userId: string, token: string, ttl = 7 * 24 * 3600) {
    await this.redis.set(`refresh:${userId}`, token, 'EX', ttl);
  }

  async getRefreshToken(userId: string): Promise<string | null> {
    return this.redis.get(`refresh:${userId}`);
  }

  async removeRefreshToken(userId: string) {
    await this.redis.del(`refresh:${userId}`);
  }
}
