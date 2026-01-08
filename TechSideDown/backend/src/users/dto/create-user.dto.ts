import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsString()
    @IsNotEmpty()
    college: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    team: string[];

    @IsOptional()
    @IsString()
    role?: string;

    @IsOptional()
    points?: number;
}
