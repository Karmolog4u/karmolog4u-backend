import { TokenEntity } from './dto/token-entity.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { FindTokenDto } from './dto/find-token.dto';
import { UpdateTokenDto } from './dto/update-token.dto';
import { NewTokenDto } from './dto/new-token.dto';
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Token } from './schemas/token.schema';
import { DeleteTokenDto } from './dto/delete-token.dto';
import { IdDto } from 'src/common/dto/id.dto';

@Injectable()
export class TokenService {
  constructor(@InjectModel(Token.name) private tokenModel: Model<Token>) {}

  async findToken(tokenData: FindTokenDto): Promise<TokenEntity> {
    try {
      const token = await this.tokenModel.findOne({ ...tokenData });
      return token;
    } catch (error) {
      throw new NotFoundException('Токен не знайдено');
    }
  }

  async newToken(tokenData: NewTokenDto): Promise<TokenResponseDto> {
    try {
      const token = new this.tokenModel({ ...tokenData });
      await token.save();
      return {
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
      };
    } catch (error) {
      throw new BadRequestException('Помилка запису в БД');
    }
  }

  async updateToken(tokenData: UpdateTokenDto): Promise<TokenResponseDto> {
    try {
      const token = await this.tokenModel.findByIdAndUpdate(
        tokenData.id,
        {
          $set: {
            accessToken: tokenData.accessToken,
          },
        },
        { new: true },
      );
      return {
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
      };
    } catch (error) {
      throw new ForbiddenException('Помилка оновлення токену');
    }
  }
  async deleteToken(tokenData: DeleteTokenDto): Promise<{ message: string }> {
    try {
      await this.tokenModel.findOneAndDelete({
        ...tokenData,
      });
      return { message: 'success' };
    } catch (error) {
      throw new NotFoundException('Токен не знайдено або вже видалено');
    }
  }

  async deleteAllSession(id: IdDto) {
    try {
      await this.tokenModel.deleteMany({ ...id });
    } catch (error) {
      throw new BadRequestException('Помилка скасування сесій');
    }
  }
}
