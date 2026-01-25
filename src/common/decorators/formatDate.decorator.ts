import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function FormatDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'FormatDate',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} должно быть в формате YYYY-MM-DD`;
        },
      },
    });
  };
}
