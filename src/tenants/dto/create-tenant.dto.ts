import { IsString, IsEmail, IsOptional, IsDateString, IsNumber, MinLength, IsPhoneNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTenantDto {
    @ApiProperty({
        description: 'Nombre completo del inquilino',
        example: 'Juan Pérez'
    })
    @IsString()
    @MinLength(2)
    name: string;

    @ApiProperty({
        description: 'Email del inquilino',
        example: 'juan.perez@email.com'
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'Teléfono del inquilino',
        example: '+1234567890'
    })
    @IsString()
    phone: string;

    @ApiProperty({
        description: 'Documento de identidad',
        example: '12345678',
        required: false
    })
    @IsOptional()
    @IsString()
    gov_id?: string;

    @ApiProperty({
        description: 'Fecha de nacimiento',
        example: '1990-01-01',
        required: false
    })
    @IsOptional()
    @IsDateString()
    birth_date?: string;

    @ApiProperty({
        description: 'Ingresos mensuales',
        example: 5000,
        required: false
    })
    @IsOptional()
    @IsNumber()
    income?: number;

    @ApiProperty({
        description: 'Notas adicionales del propietario',
        example: 'Inquilino responsable, paga a tiempo',
        required: false
    })
    @IsOptional()
    @IsString()
    notes?: string;
}
