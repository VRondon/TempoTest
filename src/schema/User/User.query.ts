import {
  Resolver, Query, Arg,
} from 'type-graphql';

// Models
import { User } from '~/schema/User/User.model';

// Utils
import { calculateWorkedHours } from '~/utils/Tempo/tempo';

// Inputs
import { GetBillableHoursInput } from './input';

@Resolver(User)
export class UserQueryResolver {
  @Query(() => Number)
  public async getBillableHoursByEmail(@Arg('input') input: GetBillableHoursInput) {
    const filter = {
      from: input.from,
      to: input.to,
    }
    const workedHours = await calculateWorkedHours(input.email, filter);
    return workedHours;
  }
}
