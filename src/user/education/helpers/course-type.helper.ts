/**
 * Course type constants
 */
export enum CourseTypeEnum {
  SSK_INDEPENDENT = 'SSK_INDEPENDENT',
  SSK_WITH_CURATOR = 'SSK_WITH_CURATOR',
  SSK_WITH_SERGIY = 'SSK_WITH_SERGIY',
  ADVANCED = 'ADVANCED',
  CONSULTING = 'CONSULTING',
}

/**
 * Map full course type names to short abbreviations
 */
export const courseTypeShortMap: Record<CourseTypeEnum | string, string> = {
  [CourseTypeEnum.SSK_INDEPENDENT]: 'ssk_ind',
  [CourseTypeEnum.SSK_WITH_CURATOR]: 'ssk_cur',
  [CourseTypeEnum.SSK_WITH_SERGIY]: 'ssk_ser',
  [CourseTypeEnum.ADVANCED]: 'adv',
  [CourseTypeEnum.CONSULTING]: 'cons',
};

/**
 * Get short name for course type
 * @param courseType - Full course type name
 * @returns Short abbreviation (e.g., 'ssk_ind')
 */
export function getCourseTypeShortName(courseType: string): string {
  const shortName = courseTypeShortMap[courseType];
  if (!shortName) {
    throw new Error(`Unknown course type: ${courseType}`);
  }
  return shortName;
}

/**
 * Get all SSK course types
 */
export const SSK_COURSE_TYPES = [
  CourseTypeEnum.SSK_INDEPENDENT,
  CourseTypeEnum.SSK_WITH_CURATOR,
  CourseTypeEnum.SSK_WITH_SERGIY,
];

/**
 * Get all advanced course types
 */
export const ADVANCED_COURSE_TYPES = [
  CourseTypeEnum.ADVANCED,
  CourseTypeEnum.CONSULTING,
];

/**
 * Check if course type is SSK
 */
export function isSSKCourse(courseType: string): boolean {
  return SSK_COURSE_TYPES.includes(courseType as CourseTypeEnum);
}

/**
 * Check if course type is Advanced/Consulting
 */
export function isAdvancedCourse(courseType: string): boolean {
  return ADVANCED_COURSE_TYPES.includes(courseType as CourseTypeEnum);
}
