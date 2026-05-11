import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum CoursePurchaseStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  BLOCKED = 'BLOCKED',
}

export class CoursePurchaseStatusDto {
  @ApiProperty({
    description: 'Статус покупки курсу',
    enum: CoursePurchaseStatus,
    example: CoursePurchaseStatus.ACTIVE,
  })
  @IsEnum(CoursePurchaseStatus, {
    message: `status може бути лише одним із: ${Object.values(
      CoursePurchaseStatus,
    ).join(', ')}`,
  })
  status: CoursePurchaseStatus;
}
