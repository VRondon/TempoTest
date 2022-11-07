import { InputType, Field } from 'type-graphql';

@InputType()
export class GetBillableHoursInput {
  @Field()
  public email: string;

  @Field()
  public from: string;

  @Field()
  public to: string;
}
