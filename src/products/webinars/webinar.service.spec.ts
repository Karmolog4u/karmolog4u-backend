import { NotFoundException } from '@nestjs/common';
import { WebinarService } from './webinar.service';

describe('WebinarService', () => {
  const model = { aggregate: jest.fn() } as any;
  const service = new WebinarService(model, {} as any);
  const mockResult = (result: unknown[]) =>
    model.aggregate.mockReturnValue({
      exec: jest.fn().mockResolvedValue(result),
    });

  beforeEach(() => jest.clearAllMocks());

  it('sorts preview products by updatedAt descending and hides the sort field', async () => {
    const result = [{ id: 'webinar-id' }];
    mockResult(result);

    await expect(service.findPrevueWebinar()).resolves.toEqual(result);
    expect(model.aggregate.mock.calls[0][0]).toContainEqual({
      $sort: { updatedAt: -1 },
    });
    expect(model.aggregate.mock.calls[0][0]).toContainEqual({
      $project: { updatedAt: 0 },
    });
  });

  it('returns an empty preview when no products are found', async () => {
    mockResult([]);
    await expect(service.findPrevueWebinar()).resolves.toEqual([]);
  });

  it('returns the first webinar matching its id', async () => {
    const result = [{ id: 'webinar-id' }];
    mockResult(result);

    await expect(service.findWebinarById('webinar-id' as any)).resolves.toBe(
      result[0],
    );
  });

  it('throws when the webinar id is not found', async () => {
    mockResult([]);
    await expect(
      service.findWebinarById('missing-id' as any),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
