// has-course.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { CoursePurchaseService } from 'src/coursePurchase/coursePurchase.service';

@Injectable()
export class HasCourseGuard implements CanActivate {
  constructor(private coursePurchase: CoursePurchaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // from AuthGuard (JWT)
    const courseId = request.params.id; // URL param

    if (!user) throw new ForbiddenException('Зайдіть заново в аккаунт');
    if (!courseId) throw new ForbiddenException('Курс не знайдено');

    // Check if user has this course
    const hasCourse = await this.coursePurchase.userHasCourse(
      user._id,
      courseId,
    );

    if (!hasCourse) {
      throw new ForbiddenException('Немає доступу до цього курсу');
    }

    return true; // Authorized
  }
}
