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

    if (!user) throw new ForbiddenException('User not authenticated');
    if (!courseId) throw new ForbiddenException('Course ID is missing');

    // Check if user has this course
    const hasCourse = await this.coursePurchase.userHasCourse(
      user._id,
      courseId,
    );

    if (!hasCourse) {
      throw new ForbiddenException('No access to this course');
    }

    return true; // Authorized
  }
}
